
# Jest Coverage Guard

> Fail pipelines when coverage quility fails

## Usage

1. Install jest-coverage-guard in your project

	Install with npm:

	```bash
	npm install --save-dev jest-coverage-guard
	```

	Install with yarn:

	```bash
	yarn add jest-coverage-guard --dev
	```

2. Create config file (`coverage.guard.config.json`) in your project root:

      _(optional: "excludeKeywords")_

    ```json
    {
      "appRoot": "src",
      "excludeKeywords": [
        "// skip-coverage-check",
        "backbone",
        "class SomeUglyClass"
      ],
      "featureNameRegExp": {
        "body": "APP-[0-9]+",
        "flags": "g"
      },
      "excludeFiles": [ "-test.js", ".less"],
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
    `"reporters": ["default", "./node_modules/jest-coverage-guard"],`

4. Run jest tests


#### Config options

* **`appRoot`**  - path to your application source code
* **`excludeKeywords`** - keywords that will be used to skip a file from coverage. If a file contains one of the keywords the coverage check script will ignore this file.
* **`featureNameRegExp`** - patters to search commits by commit message. Assuming you are adding in each commit message a issue/ticket number the the beginning. e.g: 'APP-12345 fixed a nasty bug'
* **`excludeFiles`** - array of file extensions that should be ignored from check
* **`addedFilesQualityGate`** - config object where you specify quality gate for newly added files, defaults to:
```json
{
  "statements": 100,
  "branches": 100,
  "functions": 100,
  "lines": 100
}
```

* **`changedFilesQualityGate`** - config object where you specify quality gate for changed  files, defaults to:
```json
{
  "statements": 80,
  "branches": 80,
  "functions": 80,
  "lines": 80
}
```

## Why use it?

 This script should be executed only after jest generated the coverage report!

 This script with check your committed and uncommitted files

 This script is checking code coverage in
  - Your local environment
  - CI environment

  Locally the script will check coverage on all files that you have changed and committed
  implementing current feature and all files that you are currently working with
  but not yet committed.

  In gitlab CI it will only check files that you have changed and committed
  for this feature

  If you want to exclude your file from coverage_check for some reason:
  add a comment to your file with "skip-coverage-check", eg. `// skip-coverage-check`

  ### How does it work:

  1. Script gets the name of the current branch you are working on
  2. extracts the ticket number from the branch name eg. APP-12345
  3. gets all commits the contain this ticket number in the message
  4. get all urls of the files you have changed in those commits
  5. filters the file URL's to get only app files and skips the files that contain this.config.excludeKeywords
  6. iterates trough all file urls and searches for a corresponding report in coverageResults   -- if the report found - get the report data   -- if the report is not found
  7. after the report data is extracted, it compares the results with corresponding quality gate constant
  8. adds result of file comparison to the results table
  9. adds result errors to the errors table (if the file failed to pass)
  10. shows the result table
  11. shows errors table
  12. if error table contains errors - fail the script with exit code 1 (Pipeline failed)
  13. if error table contain no errors - pipeline will succeed

  NEXT STEPS ONLY LOCALLY:
  14. gets current git.status Object
  15. gets all files that you have changed but not yet committed
  16. gets file URL's and then does everything from step 5 to 12
