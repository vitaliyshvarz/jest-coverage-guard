
# Jest Coverage Guard

### Check code coverage only in files you commit and/or change

#### Perfect use-case: **enforcing test coverage for legacy untested code**
---
 
> Coverage quality guard will go over files you have changed and check if the file test coverage complies with defined threshold.  
>  - Works in GitHub Actions and GitLab Pipelines
>  - In CI environment checks files found in commits containing `featureNameRegExp` in commit message
>  - Locally checks both commited files containing `featureNameRegExp` in commit message and uncommited files

<p align="center">
  Example result for uncommited Files (locally, when process.env.CI != true)
</p>
 <div style="text-align:center">
  <img src="./img/cmd_example_1.png?raw=true" alt="Uncommited Files" style="width:500px; align-self: center;"/>
</div>


<p align="center">
  Example result for commited Files:
</p>
<div style="text-align:center">
  <img src="./img/cmd_example_2.png?raw=true" alt="Commited Files" style="width:500px; align-self: center;"/>
</div>

<p align="center">
  <a href="https://github.com/vitaliyshvarz/jest-coverage-guard/pull/2/checks?check_run_id=1854174888#step:7:66">Example result in Git Actions</a>
</p>

## Usage

1. Install jest-coverage-guard

	Install with npm:

	```bash
	npm install jest-coverage-guard --save-dev
	```

	Install with yarn:

	```bash
	yarn add jest-coverage-guard --dev
	```

2. Create config file (`coverage.guard.config.json`) in your project root folder:

      _(optional: "excludeKeywords",  "excludeFiles", "addedFilesQualityGate", "changedFilesQualityGate")_

    ```json
    {
      "appRootRelativeToGitRepo": "src",
      "excludeKeywords": [
        "// skip-coverage-check",
        "backbone",
        "class SomeUglyClass"
      ],
      "featureNameRegExp": {
        "body": "APP-[0-9]+",
        "flags": "g"
      },
      "excludeFiles": [ "\\-test.(js|ts)$", "\\.less$"],
      "addedFilesQualityGate": {
        "statements": 100,
        "branches": 100,
        "functions": 100,
        "lines": 100
      },
      "changedFilesQualityGate": {
        "statements": 80,
        "branches": 80,
        "functions": 80,
        "lines": 80
      }
    }
    ```

2. In your jest config file `jest.config.json` add jest-coverage-guard as a reporter:
    `"reporters": ["default", "jest-coverage-guard"],`

3. Make sure in your CI, you have process.env.CI is true, to check commited files

4. Run jest tests and see the output


#### Config options

* **`appRootRelativeToGitRepo`**  - path to your application source code !important: this path should be relative to git repository root and not to CWD
* **`excludeKeywords`** - keywords that will be used to skip files from check. If a file contains one of the keywords the coverage check script will ignore it.
* **`featureNameRegExp`** - patterns to search commits by commit message. The script assumes that you are adding a prefix to the beginning of each commit message + this prefix should be in the branch name, for example branch "feature/PROJECT-A-add-button" is having commit messages like: "PROJECT-A: fixed type in btn"
  
   - [body](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions): regexp body that would match you issue name pattern, for example: `"body": "POJECT-A-[0-9]+"`, or for multiple issue name patterns: `"body": "(POJECT-A|POJECT-B)-[0-9]+"`.
  
   - [flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Advanced_searching_with_flags): search flags, for example `"flags": "g"` will look for matches globally in branch name and in commit messages.
  
* **`excludeFiles`** - array of filename regexp bodies that should be ignored by check
* **`addedFilesQualityGate`** - config object where you specify quality gate for newly added files, defaults to:
```json
{
  "statements": 100,
  "branches": 100,
  "functions": 100,
  "lines": 100
}
```

* **`changedFilesQualityGate`** - config object where you specify quality gate for changed files, defaults to:
```json
{
  "statements": 80,
  "branches": 80,
  "functions": 80,
  "lines": 80
}
```

## Why use it?

> You can use this to fail your CI pipeline when code coverage in files you changed is not high enough.  
> This script should execute only after jest generated coverage report, so as jest custom reporter.  
> This script is able to check your committed and uncommitted files.

  Locally the script will check coverage on all files that you have changed + committed files where commit message contains `featureNameRegExp`

  In CI environment it will check changed files from commits containing `featureNameRegExp` in commit message

  If for some reason, you want to exclude your file from coverage check, add a comment to your file with "skip-coverage-check", 
  eg. `// skip-coverage-check` (it should be in excludeKeywords config).

### How does it work:

  - The script expects you to prefix each commit message eg: `APP-12345: fixed typo in awesomefile.js`
  - The script expects you to prefix your branch name with same prefix that you will use in your commits, eg: `patch/APP-12345_feature_one`
  ---
  1. Script gets the name of the current branch (config: `featureNameRegExp`)
  2. Extracts the feature-prefix from the branch name eg. APP-12345 (config: `featureNameRegExp`)
  3. Gets all commits that contain this feature-prefix in the commit message.
  4. Gets all url's of the files you have changed in those commits.
  5. Filters file URL's to get only app files (config: `appRootRelativeToGitRepo`) and skips files that contain exclude keywords (config: `excludeKeywords`).
  6. Finds report for each file from jest coverage report object.
  7. Compares the results with corresponding quality gate (config: `changedFilesQualityGate` or `addedFilesQualityGate`).
  8. Adds covearge results to results table, adds failed coverage errors to the errors table.
  9. Shows results
  10. If error table contains errors - the script fails with exit `code 1`.
  11. If error table contains errors but you are in `--watch` or `--watchAll` mode - script will not fail.
  12. If error table contains no errors - script will succeed.

  		NEXT STEPS ONLY WHEN (`process.env.CI != true`):
  13. Gets current git.status Object.
  14. Gets all files that you have changed but not yet committed.
  15. Gets file URL's and then does everything from step 6 to step 15.
