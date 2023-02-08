import { Worker, NearAccount, NEAR } from "near-workspaces";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{
    worker: Worker;
    accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Get root account
    const root = worker.rootAccount;

    // Create test accounts
    const alice = await root.createSubAccount("alice");
    const beneficiary = await root.createSubAccount("beneficiary");
    const refound = await root.createSubAccount("refound");

    // Deploy factory contract -- pass path to the wasm file as an argument
    const contract = await root.devDeploy(
        "/home/slyracoon23/Documents/refound/refound-repo/contracts/out/main.wasm",
        {
            // initialBalance: NEAR.parse("100 N").toJSON(),
            method: "new",
            args: {
                owner_id: alice.accountId,
            },
        }
    );

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        refound,
        alice,
        beneficiary,
        contract,
    };
});

test.afterEach(async (t) => {
    await t.context.worker.tearDown().catch((error) => {
        console.log("Failed tear down the worker:", error);
    });
});

test("check_owner_id tests", async (t) => {
    const { alice, contract } = t.context.accounts;

    let owner_id = await contract.view("get_owner");

    t.is(owner_id, alice.accountId);
});

// test("create_refound_subaccount_and_deploy tests", async (t) => {
//     const { refound, alice, beneficiary } = t.context.accounts;

//     let create = await alice.call(
//         refound,
//         "create_factory_subaccount_and_deploy",
//         { name: `sub`, beneficiary: beneficiary },
//         {
//             gas: "80000000000000",
//             attachedDeposit: NEAR.parse("1.24 N").toString(),
//         }
//     );

//     t.is(create, true);
// });
