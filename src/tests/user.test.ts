import chai from "chai";
import request from "supertest";
import app from "../index";
import User from "../models/User";

describe("User controller requests", () => {
    const seed = [
      new User(
        {
          email: "example001@example.com",
          password: "examplePassword",
          profile: {
            names: "user001", lastNames: "last names 001"
          }
        }
      ),
      new User(
        {
          email: "example002@example.com",
          password: "examplePassword",
          profile: {
            names: "user002", lastNames: "last names 002"
          }
        }
      )
    ];

    before(() => {
      const [ firstUser, secondUser ] = seed;
      firstUser.save();
      secondUser.save();
    });

    after(() => {
      User.remove({});
    });

    it("Should sign up a user", (done: Mocha.Done) => {
      const requestBody = {
        email: "email@example.com",
        password: "placeholderPassword",
        profile: {
          names: "example",
          lastNames: "last names"
        },
      };
      request(app).post("/users/sign-up/").send(requestBody).expect(200).end((error, response) => {
        if (error) return done(error);
        done();
      });

    });

    it("Should sign in a user", (done: Mocha.Done) => {
      const requestBody = {
        email: "example001@example.com",
        password: "examplePassword",
      };
      request(app).post("/users/sign-in/").send(requestBody).expect(200).end((error, response) => {
        if (error) return done(error);
        done();
      });
    });
});
