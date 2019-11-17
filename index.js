'use strict'

const core = require('@actions/core')
const exec = require('@actions/exec')
const github = require('@actions/github')

// most @actions toolkit packages have async methods
async function run () {
  try {
    const command = core.getInput('command')
    const filterKeywords = ['benchmark']// TODO core.getInput('keywords')

    const githubToken = core.getInput('github-token')

    let myOutput = ''
    let myError = ''

    const options = {
      listeners: {
        stdout: (data) => {
          myOutput += data.toString();
        },
        stderr: (data) => {
          myError += data.toString();
        }
        // stdline: data => { myOutput += data },
        // errline: data => { myError += data }
      }
    }

    // https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
    // pull_request_review_comment
    const event = require(process.env.GITHUB_EVENT_PATH)

    const { comment, pull_request: pullRequest, repository } = event
    if (!filterKeywords.some(_ => comment.body.includes(_))) {
      core.warning(`Ignoring comment ${comment.body}`)
      return
    }

    core.debug(`Running command ${command}`)
    await exec.exec(command, options)
    core.debug('Command executed')

    const postDest = {
      owner: process.env.GITHUB_ACTOR,
      repo: repository.name,
      issue_number: pullRequest.number,
      body: `StdOut:\n${myOutput}\n\n\nStdErr:\n${myError}`
    }
    core.debug('Creating comment in issue: ' + JSON.stringify(postDest))
    const octokit = new github.GitHub(githubToken)
    await octokit.issues.createComment(postDest)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
