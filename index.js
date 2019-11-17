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
        stdline: data => { myOutput += data },
        errline: data => { myError += data }
      }
    }

    // https://developer.github.com/v3/activity/events/types/#pullrequestreviewcommentevent
    // pull_request_review_comment
    const event = require(process.env.GITHUB_EVENT_PATH)

    const { comment, pull_request: pullRequest } = event
    if (!filterKeywords.some(_ => comment.body.includes(_))) {
      core.warn(`Ignoring comment ${comment.body}`)
      return
    }

    core.debug(`Running command ${command}`)
    await exec.exec(command, options)
    core.debug('Command executed')

    core.debug('Creating comment in issue: ', {
      owner: process.env.GITHUB_ACTOR,
      repo: process.env.GITHUB_REPOSITORY,
      issue_number: pullRequest.number
    })
    const octokit = new github.GitHub(githubToken)
    await octokit.issues.createComment({
      owner: process.env.GITHUB_ACTOR,
      repo: process.env.GITHUB_REPOSITORY,
      issue_number: pullRequest.number,
      body: `StdOut:\n${myOutput}\n\n\nStdErr:\n${myError}`
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
