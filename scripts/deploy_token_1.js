async function main() {
  // Not necessary, but just to see the account deploying from
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MDT1 with the account", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance", balance.toString());

  // Main stuff
  const Token = await ethers.getContractFactory("MashiroDemoToken1");
  const token = await Token.deploy();

  console.log("Deployment address: ", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
