const { resolve } = require('path');
const { readJsonSync, writeJSONSync, existsSync } = require('fs-extra');
const shell = require('shelljs');

const GitNoobCmd = {
  ADD: 'add',
  SET: 'set',
  LIST: 'list',
  CLONE: 'clone'
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
 * @param {*} user
 */
function add(argv, user) {
  checkArgv(argv, 2, 'add');

  user['name'] = argv[0];
  user['email'] = argv[1];
}

/**
 * Sets user to current git repository.
 * @param {string[]} argv Command line arguments.
 * @param {*} user A json object contains name & email pairs
 * @param {string} cwd Current working directory.
 */
function set(argv, user, cwd) {
  checkArgv(argv, 1, 'set');
  const [name] = argv;

  if (!user.name || user.name !== name) {
    throw new Error(`There isn't "${name}" user!`);
  }

  if (shell.which('git') && existsSync(resolve(cwd, '.git'))) {
    shell.cd(cwd);
    shell.exec(`git config user.name "${user.name}"`);
    shell.exec(`git config user.email "${user.email}"`);
  }
}

/**
 * Clones the given GitHub repository.
 * @param {string[]} argv Contains "user/repo" string.
 * @param {*} user
 * @param {string} cwd Current working directory.
 */
function clone(argv, user, cwd) {
  checkArgv(argv, 1, 'clone');

  if (shell.which('git')) {
    shell.cd(cwd);
    shell.exec(`git clone https://github.com/${argv[0]}.git`);
    set([user.name], user, cwd);
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
      add(argv, json);
      break;

    case GitNoobCmd.SET:
      set(argv, json, cwd);
      break;

    case GitNoobCmd.LIST:
      console.log(JSON.stringify(json, null, 2));
      break;

    case GitNoobCmd.CLONE:
      clone(argv, json, cwd);
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
