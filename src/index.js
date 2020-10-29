const { resolve } = require('path');
const { readJsonSync, writeJSONSync, existsSync } = require('fs-extra');
const shell = require('shelljs');

const GitNoobCmd = {
  ADD: 'add',
  SET: 'set',
  LIST: 'list'
};

/**
 * Checks the number of arguments.
 * @param {string[]} argv Command line arguments.
 * @param {number} need The number of arguments are needed.
 */
function checkArgv(argv, need, cmd) {
  if (argv.length < need) {
    throw new Error(`The "${cmd}" command needs ${need} argument(s)!`);
  }
}

/**
 * Adds new user to users.
 * @param {string[]} argv
 * @param {*} users
 */
function add(argv, users) {
  checkArgv(argv, 2, 'add');
  const [name, email] = argv;
  users[name] = email;
}

/**
 * Sets user to current git repository.
 * @param {string[]} argv Command line arguments.
 * @param {*} users A json object contains name & email pairs
 * @param {string} cwd Current working directory.
 */
function set(argv, users, cwd) {
  checkArgv(argv, 1, 'set');
  const [name] = argv;

  if (users[name] == undefined) {
    throw new Error(`There isn't "${name}" user!`);
  }

  if (shell.which('git') && existsSync(resolve(cwd, '.git'))) {
    shell.cd(cwd);
    shell.exec(`git config --replace-all user.name ${name}`);
    shell.exec(`git config user.email ${users[name]}`);
  }
}

/**
 * Lists all saved users.
 * @param {*} users A json object contains name & email pairs
 */
function list(users) {
  console.log('List of users:');

  for (const user in users) {
    console.log('\t', user, users[user]);
  }
}

/**
 * Runs gitnoob.
 * @param {string} cwd Current working directory.
 * @param {string[]} argv Command line arguments.
 */
function gitnoob(cwd, cmd, argv) {
  const jsonPath = resolve(__dirname, '../gitnoob.json');
  const json = readJsonSync(jsonPath);

  switch (cmd) {
    case GitNoobCmd.ADD:
      add(argv, json.users);
      break;

    case GitNoobCmd.SET:
      set(argv, json.users, cwd);
      break;

    case GitNoobCmd.LIST:
      list(json.users);
      break;

    default:
      throw new Error(`There is no "${cmd}" commmand!`);
  }

  writeJSONSync(jsonPath, json);
}

module.exports = {
  GitNoobCmd,
  gitnoob
};
