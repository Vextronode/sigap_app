{
  description = "Development environment";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
      config.allowUnfree = true;
    };
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_24
        bun
        pnpm
        yarn
        typescript
        prisma-engines
        openssl
      ];

      shellHook = ''
        export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
        export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
        export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.openssl ]}:$LD_LIBRARY_PATH"
      '';
    };
  };
}
