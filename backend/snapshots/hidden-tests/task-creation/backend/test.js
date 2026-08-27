import bcrypt from "bcryptjs";
import taskModel from "./models/Task.js";
import userModel from "./models/User.js";
import { createTask } from "./controllers/taskController.js";
import { signupUser, loginUser } from "./controllers/userController.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });
const results = [];

function check(name, condition, detail = "") {
  results.push({ name, pass: !!condition, detail });
}

function mockRes() {
  let resolveDone;

  const done = new Promise((resolve) => {
    resolveDone = resolve;
  });

  const res = {
    statusCode: null,
    body: null,
    cookies: [],

    status(code) {
      res.statusCode = code;
      return res;
    },

    json(payload) {
      res.body = payload;
      resolveDone();
      return res;
    },

    cookie(name, value, options) {
      res.cookies.push({ name, value, options });
      return res;
    },

    done,
  };

  return res;
}

async function run() {
  const createdTaskIds = [];
  const createdUserIds = [];

  try {
    {
      const payload = {
        title: "New Task",
        description: "New Description",
        status: "To Do",
        priority: "Medium",
        dueDate: "2026-08-13",
      };

      const res = mockRes();

      await createTask({ body: payload }, res);

      check(
        "createTask creates and returns the task",
        res.statusCode === 201 &&
          !!res.body?._id &&
          res.body?.title === payload.title &&
          res.body?.status === payload.status &&
          res.body?.priority === payload.priority &&
          res.body?.dueDate?.toISOString?.().startsWith("2026-08-13"),
        `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
      );

      if (res.body?._id) {
        createdTaskIds.push(res.body._id);
      }

      const persisted = await taskModel.findById(res.body?._id);

      check(
        "createTask persists the created task",
        !!persisted &&
          persisted.title === payload.title &&
          persisted.status === payload.status &&
          persisted.priority === payload.priority,
        `got ${JSON.stringify(persisted)}`
      );
    }

    {
      const res = mockRes();

      await createTask({ body: { title: "no" } }, res);

      check(
        "createTask rejects invalid input",
        res.statusCode >= 400 && res.statusCode < 500,
        `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
      );
    }

    const email = `new.user.${Date.now()}@example.com`;
    const rawPassword = "supersecret123";

    {
      const res = mockRes();

      signupUser(
        {
          body: {
            email: `  ${email.toUpperCase()}  `,
            password: rawPassword,
          },
        },
        res
      );

      await res.done;

      check(
        "signup creates a user successfully",
        res.statusCode === 201 &&
          res.body?.success === true &&
          !!res.body?._id &&
          res.body?.email === email &&
          Object.keys(res.body).sort().join(",") === "_id,email,success" &&
          res.cookies.some((cookie) => cookie.name === "jwt" && !!cookie.value),
        `got status ${res.statusCode}, body ${JSON.stringify(
          res.body
        )}, cookies ${JSON.stringify(res.cookies)}`
      );

      if (res.body?._id) {
        createdUserIds.push(res.body._id);
      }

      const persisted = await userModel.findOne({ email });

      check(
        "signup normalizes email and stores a bcrypt password hash",
        !!persisted &&
          persisted.password !== rawPassword &&
          (await bcrypt.compare(rawPassword, persisted.password)),
        `got user ${JSON.stringify(persisted)}`
      );
    }

    {
      const dupeEmail = `dupe.user.${Date.now()}@example.com`;

      const existing = new userModel({
        email: dupeEmail,
        password: await bcrypt.hash("irrelevant123", 10),
      });

      await existing.save();
      createdUserIds.push(existing._id);

      const res = mockRes();

      signupUser(
        {
          body: {
            email: `  ${dupeEmail.toUpperCase()}  `,
            password: "whatever123",
          },
        },
        res
      );

      await res.done;

      check(
        "signup rejects a duplicate normalized email",
        res.statusCode === 400 &&
          res.body?.message === "User already exists" &&
          res.cookies.length === 0,
        `got status ${res.statusCode}, body ${JSON.stringify(
          res.body
        )}, cookies ${JSON.stringify(res.cookies)}`
      );
    }



    const loginEmail = `login.user.${Date.now()}@example.com`;
    const loginPassword = "loginpass123";

    {
      const res = mockRes();

      signupUser(
        {
          body: {
            email: loginEmail,
            password: loginPassword,
          },
        },
        res
      );

      await res.done;

      if (res.body?._id) {
        createdUserIds.push(res.body._id);
      }
    }

    {
      const res = mockRes();

      loginUser(
        {
          body: {
            email: loginEmail,
            password: loginPassword,
          },
        },
        res
      );

      await res.done;

      check(
        "login authenticates valid credentials",
        res.statusCode === 200 &&
          !!res.body?._id &&
          res.body?.email === loginEmail &&
          res.cookies.some((cookie) => cookie.name === "jwt" && !!cookie.value),
        `got status ${res.statusCode}, body ${JSON.stringify(
          res.body
        )}, cookies ${JSON.stringify(res.cookies)}`
      );
    }

    {
      const res = mockRes();

      loginUser(
        {
          body: {
            email: `nonexistent.${Date.now()}@example.com`,
            password: "irrelevant123",
          },
        },
        res
      );

      await res.done;

      check(
        "login rejects a non-existent user",
        res.statusCode === 404,
        `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
      );
    }

    {
      const res = mockRes();

      loginUser(
        {
          body: {
            email: loginEmail,
            password: "wrongpassword123",
          },
        },
        res
      );

      await res.done;

      check(
        "login rejects an incorrect password",
        res.statusCode === 401,
        `got status ${res.statusCode}, body ${JSON.stringify(res.body)}`
      );
    }
  } finally {
      for (const id of createdTaskIds) {
        await taskModel.findByIdAndDelete(id);
      }

      for (const id of createdUserIds) {
        await userModel.findByIdAndDelete(id);
      }
  }

  const failed = results.filter((result) => !result.pass);

  for (const result of results) {
    console.log(
      (result.pass ? "PASS - " : "FAIL - ") +
        result.name +
        (result.pass ? "" : ` (${result.detail})`)
    );
  }

  if (failed.length > 0) {
    console.log(`\n${failed.length} test(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("\nAll tests passed.");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});