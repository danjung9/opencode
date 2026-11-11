#!/usr/bin/env bash
# render-homebrew.sh <sign-macos dir> <build-archives dir> <tap dir>: writes Formula warcode-v2.rb with the
# hashes of the signed macOS and the Linux archives.
. "$(dirname "$0")/lib.sh"

macos=$1 archives=$2 tap=$3
sum() { sha256 "$1" | cut -c1-64; }
base="https://opencode.ai/files/bin/$OPENCODE_VERSION"
cat > "$tap/warcode-v2.rb" <<FORMULA
# typed: false
# frozen_string_literal: true

class WarcodeV2 < Formula
  desc "Warcode V2 - the AI coding agent for the terminal"
  homepage "https://github.com/anomalyco/opencode"
  version "$WARCODE_VERSION"
  license "MIT"

  depends_on "ripgrep"
  conflicts_with "warcode", because: "both install an warcode binary"

  on_macos do
    if Hardware::CPU.arm?
      url "$base/warcode-darwin-arm64.zip"
      sha256 "$(sum "$macos/warcode-darwin-arm64.zip")"
    else
      url "$base/warcode-darwin-x64-baseline.zip"
      sha256 "$(sum "$macos/warcode-darwin-x64-baseline.zip")"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "$base/warcode-linux-arm64.tar.gz"
      sha256 "$(sum "$archives/warcode-linux-arm64.tar.gz")"
    else
      url "$base/warcode-linux-x64-baseline.tar.gz"
      sha256 "$(sum "$archives/warcode-linux-x64-baseline.tar.gz")"
    end
  end

  def install
    bin.install "warcode"
  end
end
FORMULA
cat "$tap/warcode-v2.rb"
