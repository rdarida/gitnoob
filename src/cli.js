#!/usr/bin/env node

const { gitnoob } = require('.');

((cwd, argv) => {
  try {
    if (!argv.length) {
      throw new Error("There isn't enough argument!");
    }

    gitnoob(cwd, argv[0], argv.slice(1));
  } catch (error) {
    console.log(error);
  }

  process.exit();
})(process.cwd(), process.argv.slice(2));
