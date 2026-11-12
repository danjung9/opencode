{
  lib,
  stdenvNoCC,
  callPackage,
  bun,
  nodejs,
  sysctl,
  makeBinaryWrapper,
  models-dev,
  ripgrep,
  wayland,
  installShellFiles,
  versionCheckHook,
  writableTmpDirAsHomeHook,
  node_modules ? callPackage ./node_modules.nix { },
}:
stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "warcode";
  inherit (node_modules) version src;
  inherit node_modules;

  nativeBuildInputs = [
    bun
    nodejs # for patchShebangs node_modules
    installShellFiles
    makeBinaryWrapper
    models-dev
    writableTmpDirAsHomeHook
  ];

  postPatch = ''
    # NOTE: Relax Bun version check to be a warning instead of an error
    substituteInPlace packages/script/src/index.ts \
      --replace-fail 'throw new Error(`This script requires bun@''${expectedBunVersionRange}' \
                     'console.warn(`Warning: This script requires bun@''${expectedBunVersionRange}'
  '';

  configurePhase = ''
    runHook preConfigure

    cp -R ${finalAttrs.node_modules}/. .
    patchShebangs node_modules
    patchShebangs packages/*/node_modules

    runHook postConfigure
  '';

  env.MODELS_DEV_API_JSON = "${models-dev}/dist/_api.json";
  env.WARCODE_DISABLE_MODELS_FETCH = true;
  env.WARCODE_VERSION = finalAttrs.version;
  env.WARCODE_CHANNEL = "prod";
  env.NODE_OPTIONS = "--max-old-space-size=4096";

  buildPhase = ''
    runHook preBuild

    cd ./packages/cli
    bun --bun ./script/build.ts --single --skip-install

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    install -Dm755 dist/cli-*/bin/warcode $out/bin/warcode

    # OpenTUI dlopens Wayland for clipboard images.
    wrapProgram $out/bin/warcode \
      --prefix PATH : ${
        lib.makeBinPath (
          [
            ripgrep
          ]
          # bun runs sysctl to detect if running on rosetta2
          ++ lib.optional stdenvNoCC.hostPlatform.isDarwin sysctl
        )
      } ${lib.optionalString stdenvNoCC.hostPlatform.isLinux ''
        --prefix LD_LIBRARY_PATH : ${lib.makeLibraryPath [ wayland ]}
      ''}

    ln -s warcode $out/bin/warcode2

    runHook postInstall
  '';

  postInstall = lib.optionalString (stdenvNoCC.buildPlatform.canExecute stdenvNoCC.hostPlatform) ''
    # v2 dropped the `completion` subcommand; --completions is the global flag.
    # --completions also accepts sh, which emits the same script as bash.
    # staged to files, substitute below rejects anything that is not a regular file
    $out/bin/warcode --completions bash > warcode.bash
    $out/bin/warcode --completions zsh > _warcode
    $out/bin/warcode --completions fish > warcode.fish

    installShellCompletion --cmd warcode \
      --bash warcode.bash \
      --fish warcode.fish \
      --zsh _warcode

    # WARCODE_CLI_NAME is a build-time define, so the warcode2 copies are
    # renamed rather than regenerated. --replace-fail is a global literal
    # substitution, so any lowercase warcode that later appears in a
    # description or help text ships as warcode2 in the warcode2 copy.
    substitute warcode.bash warcode2.bash --replace-fail warcode warcode2
    substitute _warcode _warcode2 --replace-fail warcode warcode2
    substitute warcode.fish warcode2.fish --replace-fail warcode warcode2

    installShellCompletion --cmd warcode2 \
      --bash warcode2.bash \
      --fish warcode2.fish \
      --zsh _warcode2
  '';

  nativeInstallCheckInputs = [
    versionCheckHook
    writableTmpDirAsHomeHook
  ];
  doInstallCheck = true;
  versionCheckKeepEnvironment = [ "HOME" "WARCODE_DISABLE_MODELS_FETCH" ];
  versionCheckProgramArg = "--version";

  passthru = {
    env = finalAttrs.env;
  };

  meta = {
    description = "The open source coding agent";
    homepage = "https://opencode.ai";
    license = lib.licenses.mit;
    mainProgram = "warcode";
    inherit (node_modules.meta) platforms;
  };
})
