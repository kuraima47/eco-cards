const { Sequelize } = require("sequelize");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { before, after } = require("mocha");

chai.use(chaiHttp);

const sequelize = new Sequelize("sqlite::memory:", { logging: false });

before(async () => {
  await sequelize.sync({ force: true });
});

after(async () => {
  await sequelize.close();
});

module.exports = { sequelize, chai };
