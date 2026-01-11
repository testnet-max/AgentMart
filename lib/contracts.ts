// Contract addresses - will be loaded from deployments.json
export const getContracts = () => {
  // In production, load from environment or static import
  return {
    mnee: process.env.NEXT_PUBLIC_MNEE_ADDRESS || '',
    registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '',
    escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '',
  };
};

// ABIs - will be imported from the parent abis folder
export { default as MockMNEEABI } from '../../abis/MockMNEE.json';
export { default as AgentRegistryABI } from '../../abis/AgentRegistry.json';
export { default as JobEscrowABI } from '../../abis/JobEscrow.json';

