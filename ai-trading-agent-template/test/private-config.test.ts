import { expect } from "chai";
import { Wallet } from "ethers";
import { requiredAddress, requiredPrivateKey } from "../scripts/private-config";

describe("Private script configuration", () => {
  const name = "NEXUS_CONFIG_TEST_VALUE";
  const previous = process.env[name];
  afterEach(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });

  it("requires explicit configuration", () => {
    delete process.env[name];
    expect(() => requiredAddress(name)).to.throw(`Set ${name}`);
    expect(() => requiredPrivateKey(name)).to.throw(`Set ${name}`);
  });

  it("accepts a privately generated wallet key", () => {
    const wallet = Wallet.createRandom();
    process.env[name] = wallet.privateKey;
    expect(requiredPrivateKey(name)).to.equal(wallet.privateKey);
    process.env[name] = wallet.address;
    expect(requiredAddress(name)).to.equal(wallet.address);
  });

  it("does not reveal malformed secrets in errors", () => {
    process.env[name] = "invalid-sensitive-input";
    for (const read of [requiredAddress, requiredPrivateKey]) {
      try { read(name); throw new Error("Expected rejection"); }
      catch (error) {
        expect((error as Error).message).not.to.contain(process.env[name]);
        expect((error as Error).message).to.contain(name);
      }
    }
  });
});
