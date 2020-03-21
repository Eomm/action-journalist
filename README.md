# Action Journalist

![test-local](https://github.com/Eomm/action-journalist/workflows/test-local/badge.svg)

Run a command line asking to this Action to post the results in a comment.


## Usage

```yml
- name: Execute the command
  id: journalist
  uses: Eomm/action-journalist@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    keywords: '["#journalist say hi"]'
    command: echo 'hello world'
```

### Input

You need only to create a step with these parameters:

- `github-token`: the GH token to post the output of the command in the issue or pr
- `keywords`: run the command only if the body message contains one of these keywords. The input must be a stringified array.
- `command`: the command line to execute

### Output

If the command run, this action will set the output:

- `stdout`: the string output of the std output of the command execution
- `stderr`: the string output of the std error of the command execution

To use them you need to referece them like this: `steps.<step id>.outputs.stdout`


## Examples

Run the application's benchmark simply posting a comment on a Pull Request.

```yml
name: run benchmark
on:
  issue_comment:
    types: [created]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Install the application
      run: npm install
    - name: Execute the command
      uses: Eomm/action-journalist@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        keywords: '["#journalist run benchmark"]'
        command: npm run benchmark
```


## License

Licensed under [MIT](./LICENSE).
