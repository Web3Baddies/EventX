import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof ethers & {
      getSigners: () => Promise<ethers.Signer[]>;
      getContractFactory: (name: string) => Promise<ethers.ContractFactory>;
    };
    run: (task: string, params?: any) => Promise<any>;
  }
}
