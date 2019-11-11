'use strict'

const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const command = core.getInput('command');
    // const filterKeywords = core.getInput('keywords'); // TODO

    const githubToken = core.getInput('github-token');



    let myOutput = '';
    let myError = '';

    const options = {};
    options.listeners = {
      stdline: (data) => {
        myOutput += data;
      },
      errline: (data) => {
        myError += data;
      }
    };

    core.debug(`Running command ${command}`)
    await exec.exec(command, options);
    core.debug('Command executed')

    const octokit = new github.GitHub(githubToken);
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body
    })
    Parameters

    wait(parseInt(command));
    core.debug((new Date()).toTimeString())

    core.setOutput('time', new Date().toTimeString());
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
