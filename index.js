'use strict'

const core = require('@actions/core')
const exec = require('@actions/exec')
const github = require('@actions/github')

async function run () {
  try {
    const command = core.getInput('command')
    const githubToken = core.getInput('github-token')
    const filterKeywords = JSON.parse(core.getInput('keywords'))

    const event = require(process.env.GITHUB_EVENT_PATH)
    const {
      comment,
      pull_request: pullRequest,
      issue,
      repository
    } = event
    if (!filterKeywords.some(_ => comment.body.includes(_))) {
      core.warning(`Ignoring comment ${comment.body}`)
      return
    }

    let myOutput = ''
    let myError = ''

    const options = {
      listeners: {
        stdline: data => { myOutput += (data + '\n') },
        errline: data => { myError += (data + '\n') }
      }
    }

    core.debug(`Running command ${command}`)
    await exec.exec(command, [], options)
    core.debug('Command executed')

    const issueNumber = pullRequest ? pullRequest.number : issue.number

    const postDest = {
      owner: process.env.GITHUB_ACTOR,
      repo: repository.name,
      issue_number: issueNumber,
      body: `StdOut:\n\`\`\`\n${myOutput}\n\`\`\`\n\n\nStdErr:\n\`\`\`\n${myError}\n\`\`\``
    }

    core.debug(`Creating comment in issue: ${JSON.stringify(postDest)}`)
    const octokit = new github.GitHub(githubToken)
    await octokit.issues.createComment(postDest)

    core.setOutput('stdout', myOutput)
    core.setOutput('stderr', myError)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
