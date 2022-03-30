---
noteId: "0d1b7090b1d311eb8c4ed19e49359bd0"
tags: []

---

# Contributor's Guide

Welcome; we appreciate you and would like to thank you for contributing to our project. This document aims to facilitate the process and share with you some structure that hopefully will remove any roadblock.

## Issues

---
### Guidelines:

1. Each reported issue shall have a name and description.
2. It should also have a detailed description of the requested feature.
3. It should also contain a label with the bounty price
4. It should include the expected solution. 
5. It should also contain who is requesting the feature.
6. The issue shall be reviewed and approved by one of the collaborators in the projects before any contributor starts working on it.
7. Once the issue is approved, it shall be assigned to the contributor.
---
### Discussion
1.  The issue discussion shall include the basics principles of communication.
2. It should be clear, and if a solution is proposed, it should include pros and cons.
3. If a question is asked, it should tag at least one of the project collaborators who will provide some guidance around the issue and/or the solution
---
### Solution
1. Each PR shall include the [**Ethereum Address**][1] for the bounty payment.
2. The PR shall include a clear description of the proposed solution
3. If there is any additional information or link, it shall be included in the description.
4. The PR shall be cleaned up with [eslint][2]
5. (Optional) The contributor has the option to include the Twitter handle.
---

## Contributing

### 1 Clone your fork:
```
$ git clone git@github.com:YOUR-USERNAME/YOUR-FORKED-REPO.git
```

### Add remote from original repository in your forked repository:
```
$ cd into/cloned/fork-repo
$ git remote add upstream git://github.com/ORIGINAL-DEV-USERNAME/REPO-YOU-FORKED-FROM.git
$ git fetch upstream
```

### Updating your fork from original repo to keep up with their changes:
```
$ git checkout master
$ git pull --rebase upstream master
$ git checkout your-branch
$ git pull --rebase master
```

### Build and test the solution:
```
$ npm run build
$ npm run ganache:start
$ npm run test
```

### Add commits and push
```
$ git add .
$ git commit -m "MESSAGE"
$ git push origin master
```

If you have any comment or ideas in terms of making this process better, please let us know or submit a PR.

[1]: [https://eslint.org/]
[2]: [https://coinmarketcap.com/currencies/bepro-network/]
