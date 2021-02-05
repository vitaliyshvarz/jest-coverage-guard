
# Jest Coverage Guard

### Check code coverage only files you change

#### Perfect Use case: **Enforce code coverage for legacy uncovered code**
---
 
> Coverage quality guard will fail your tests if coverage in changed files is below defined threshold.  
>  - Works in GitHub Actions and GitLab Pipelines
>  - In CI environment checks files found in commits containing `featureNameRegExp` in message
>  - Locally checks changed files and commited files on current branch

<p align="center">
  Example result for uncommited Files (process.env.CI == 'false')
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
  <a href="https://github.com/vitaliyshvarz/vue_coverage_test_app/runs/1831230170?check_suite_focus=true">Example fail  result in Git Actions</a>
</p>

## Usage

1. Install jest-coverage-guard in your project

	Install with npm:

	```bash
	npm install jest-coverage-guard --save-dev
	```

	Install with yarn:

	```bash
	yarn add jest-coverage-guard --dev
	```

2. Create config file (`coverage.guard.config.json`) in your project root:

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

3. Make sure that in your CI you have process.env.CI === 'true' to check commited files

4. Run jest tests and see the output


#### Config options

* **`appRootRelativeToGitRepo`**  - path to your application source code !important: this path should be relative to git repository root and not to CWD
* **`excludeKeywords`** - keywords that will be used to skip a file from check. If a file contains one of the keywords the coverage check script will ignore it.
* **`featureNameRegExp`** - patterns to search commits by commit message. The script assumes that you are adding an issue/ticket number at the the beginning in of each commit message and you branch name, for example branch "feature/PROJECT-A-add-button" is having commit messages with like this "PROJECT-A: fixed type in btn"
  
   - [body](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions): regexp body that should match you issue name pattern, for example: `"body": "POJECT-A-[0-9]+"`, or for multiple issue name patterns: `"body": "(POJECT-A|POJECT-B)-[0-9]+"`.
  
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

> You can use this to fail your CI pipeline when code coverage is not high enough.  
> This script should be executed only after jest generated the coverage report, so as jest custom reporter.  
> This script with check your committed and uncommitted files.

  Locally the script will check coverage on all files that you have changed and committed
  implementing current feature and all files that you are currently working with
  but not yet committed.

  In CI environment it will check changed files from commits containing `featureNameRegExp` in message

  If you want to exclude your file from coverage_check for some reason (it should be in excludeKeywords config):
  add a comment to your file with "skip-coverage-check", eg. `// skip-coverage-check`

### How does it work:

  1. The script assumes that you are working with a project management software where you have ticket/issue
	numbers that are appended or included in every commit message, eg: "APP-12345: fixed typo in awesomefile.js"
  2. Script gets the name of the current branch (config: featureNameRegExp)
  3. Extracts the ticket number from the branch name eg. APP-12345 (config: featureNameRegExp)
  4. Gets all commits that contain this ticket number in the commit message.
  5. Gets all url's of the files you have changed in those commits.
  6. Filters file URL's to get only app files (config: appRootRelativeToGitRepo) and skips files that contain exclude keywords (config: excludeKeywords).
  7. Finds report for each file from jest coverage report object.
  8. Compares the results with corresponding quality gate mask.
  9. Adds results to results table.
  10. Adds failed coverage errors to the errors table.
  11. Shows the result tables.
  12. If error table contains errors - the script fails with exit `code 1`.
  13. If error table contains errors but you are in `--watch` or `--watchAll` mode - script will not fail.
  14. If error table contains no errors - script will succeed.

  		NEXT STEPS ONLY WHEN RUNNING LOCALLY:
  15. Gets current git.status Object.
  16. Gets all files that you have changed but not yet committed.
  17. Gets file URL's and then does everything from step 6 to step 15.
