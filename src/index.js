const { resolve } = require('path');
const { readJsonSync, writeJSONSync, existsSync } = require('fs-extra');
const shell = require('shelljs');

const GitNoobCmd = {
  USER: 'user',
  SET: 'set',
  DUMP: 'dump',
  CLONE: 'clone'
};

/**
 * Checks the number of arguments.
 * @param {string[]} argv Command line arguments.
 * @param {number} need The number of arguments are needed.
 */
function checkArgv(argv, need, cmd) {
  if (argv.length !== need) {
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

  if (!user.name) {
    throw new Error(`There isn't any user!`);
  } else if (user.name !== name) {
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
  checkArgv(argv, 2, 'clone');
  const [name, repo] = argv;

  if (shell.which('git')) {
    const link = `https://github.com/${name}/${repo}.git`;

    shell.cd(cwd);
    shell.exec(`git clone ${link}`);
    set([user.name], user, resolve(cwd, repo));
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
    case GitNoobCmd.USER:
      add(argv, json);
      break;

    case GitNoobCmd.SET:
      set(argv, json, cwd);
      break;

    case GitNoobCmd.DUMP:
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
