const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WalletBook Contract", function () {
  let walletBook;
  let owner, user1, user2, contactA, contactB;

  beforeEach(async function () {
    [owner, user1, user2, contactA, contactB] = await ethers.getSigners();
    const WalletBookFactory = await ethers.getContractFactory("WalletBook");
    walletBook = await WalletBookFactory.deploy();
    await walletBook.waitForDeployment();
  });

  describe("addContact", function () {
    it("should allow a user to add a contact and emit ContactAdded", async function () {
      const tx = await walletBook.connect(user1).addContact("Alice Work", contactA.address);
      const receipt = await tx.wait();

      // Check event
      await expect(tx)
        .to.emit(walletBook, "ContactAdded")
        .withArgs(user1.address, 1n, "Alice Work", contactA.address);

      const contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(1);
      expect(contacts[0].id).to.equal(1n);
      expect(contacts[0].name).to.equal("Alice Work");
      expect(contacts[0].walletAddress).to.equal(contactA.address);

      const count = await walletBook.connect(user1).getMyContactCount();
      expect(count).to.equal(1n);
    });

    it("should revert if name is empty", async function () {
      await expect(
        walletBook.connect(user1).addContact("", contactA.address)
      ).to.be.revertedWith("WalletBook: Name cannot be empty");
    });

    it("should revert if address is address(0)", async function () {
      await expect(
        walletBook.connect(user1).addContact("Zero", ethers.ZeroAddress)
      ).to.be.revertedWith("WalletBook: Invalid wallet address");
    });

    it("should revert if name exceeds 64 bytes", async function () {
      const longName = "A".repeat(65);
      await expect(
        walletBook.connect(user1).addContact(longName, contactA.address)
      ).to.be.revertedWith("WalletBook: Name too long (max 64 bytes)");
    });
  });

  describe("updateContact", function () {
    beforeEach(async function () {
      await walletBook.connect(user1).addContact("Alice Initial", contactA.address);
    });

    it("should allow the contact owner to update contact name and address", async function () {
      const tx = await walletBook
        .connect(user1)
        .updateContact(1n, "Alice Primary", contactB.address);

      await expect(tx)
        .to.emit(walletBook, "ContactUpdated")
        .withArgs(user1.address, 1n, "Alice Primary", contactB.address);

      const contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(1);
      expect(contacts[0].name).to.equal("Alice Primary");
      expect(contacts[0].walletAddress).to.equal(contactB.address);
    });

    it("should revert when updating with empty name", async function () {
      await expect(
        walletBook.connect(user1).updateContact(1n, "", contactB.address)
      ).to.be.revertedWith("WalletBook: Name cannot be empty");
    });

    it("should revert when updating with zero address", async function () {
      await expect(
        walletBook.connect(user1).updateContact(1n, "Alice", ethers.ZeroAddress)
      ).to.be.revertedWith("WalletBook: Invalid wallet address");
    });

    it("should revert when updating non-existent contact", async function () {
      await expect(
        walletBook.connect(user1).updateContact(999n, "Ghost", contactB.address)
      ).to.be.revertedWith("WalletBook: Contact not found");
    });
  });

  describe("deleteContact", function () {
    beforeEach(async function () {
      await walletBook.connect(user1).addContact("Contact 1", contactA.address); // id: 1
      await walletBook.connect(user1).addContact("Contact 2", contactB.address); // id: 2
      await walletBook.connect(user1).addContact("Contact 3", owner.address);    // id: 3
    });

    it("should allow a user to delete a contact and emit ContactDeleted", async function () {
      const tx = await walletBook.connect(user1).deleteContact(2n);

      await expect(tx)
        .to.emit(walletBook, "ContactDeleted")
        .withArgs(user1.address, 2n);

      const contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(2);

      // Verify contact 2 is no longer found
      const ids = contacts.map((c) => c.id);
      expect(ids).to.not.include(2n);
      expect(ids).to.include(1n);
      expect(ids).to.include(3n);
    });

    it("should correctly handle deleting the first, middle, and last contacts", async function () {
      // Delete last contact (id: 3)
      await walletBook.connect(user1).deleteContact(3n);
      let contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(2);
      expect(contacts.map((c) => c.id)).to.deep.equal([1n, 2n]);

      // Delete first contact (id: 1)
      await walletBook.connect(user1).deleteContact(1n);
      contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(1);
      expect(contacts[0].id).to.equal(2n);

      // Delete the only remaining contact
      await walletBook.connect(user1).deleteContact(2n);
      contacts = await walletBook.connect(user1).getMyContacts();
      expect(contacts.length).to.equal(0);
    });

    it("should revert if contact does not exist or was already deleted", async function () {
      await walletBook.connect(user1).deleteContact(1n);
      await expect(
        walletBook.connect(user1).deleteContact(1n)
      ).to.be.revertedWith("WalletBook: Contact not found");
    });
  });

  describe("Privacy & Access Control Isolation", function () {
    it("should isolate contacts strictly per user wallet", async function () {
      // User 1 adds a contact
      await walletBook.connect(user1).addContact("User1 Private Contact", contactA.address);

      // User 2 adds a contact
      await walletBook.connect(user2).addContact("User2 Private Contact", contactB.address);

      // User 1 sees only their contact
      const u1Contacts = await walletBook.connect(user1).getMyContacts();
      expect(u1Contacts.length).to.equal(1);
      expect(u1Contacts[0].name).to.equal("User1 Private Contact");

      // User 2 sees only their contact
      const u2Contacts = await walletBook.connect(user2).getMyContacts();
      expect(u2Contacts.length).to.equal(1);
      expect(u2Contacts[0].name).to.equal("User2 Private Contact");

      // User 2 cannot update User 1's contact (id 1 for user 1)
      await expect(
        walletBook.connect(user2).updateContact(1n, "Hacked Name", contactB.address)
      ).to.be.revertedWith("WalletBook: Contact not found");

      // User 2 cannot delete User 1's contact
      await expect(
        walletBook.connect(user2).deleteContact(1n)
      ).to.be.revertedWith("WalletBook: Contact not found");
    });
  });
});

