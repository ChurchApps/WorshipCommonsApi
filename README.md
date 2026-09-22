<img align="right" width="140" alt="WorshipCommons" src="https://raw.githubusercontent.com/ChurchApps/WorshipCommons/main/public/favicon.svg">

# WorshipCommons API

[![License](https://img.shields.io/github/license/ChurchApps/WorshipCommonsApi?style=flat-square)](https://github.com/ChurchApps/WorshipCommonsApi/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/ChurchApps/WorshipCommonsApi?style=flat-square&color=yellow)](https://github.com/ChurchApps/WorshipCommonsApi/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/ChurchApps/WorshipCommonsApi?style=flat-square)](https://github.com/ChurchApps/WorshipCommonsApi/commits)
[![Sponsor](https://img.shields.io/badge/Sponsor-ea4aaa?style=flat-square&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/ChurchApps)
[![Slack](https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=slack&logoColor=white)](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg)

> **WorshipCommons API** keeps the <a href="https://worshipcommons.org/">worshipcommons.org</a> catalog in sync. The website itself reads the commons module of <a href="https://github.com/ChurchApps/Api">ChurchApps/Api</a>. This repo vendors the song index and runs the jobs that update it.

<p align="center">
  <a href="https://worshipcommons.org/">
    <img width="100%" alt="A song from the catalog this repo syncs" src="docs/preview-song.png">
  </a>
</p>

A service of [ChurchApps](https://churchapps.org).

## The repos

| Repo | What it is |
| --- | --- |
| [WorshipCommons](https://github.com/ChurchApps/WorshipCommons) | The website |
| [WorshipCommonsContent](https://github.com/ChurchApps/WorshipCommonsContent) | The songs. This repo copies its `catalog.json` |
| [WorshipCommonsApi](https://github.com/ChurchApps/WorshipCommonsApi) | This repo: catalog sync |
| [Api](https://github.com/ChurchApps/Api) | Accounts, and the commons API the website calls |

## Get Involved

### 🤝 Help Support Us

The only reason this program is free is because of the generous support from users. If you want to support us to keep this free, please head over to [ChurchApps](https://churchapps.org/partner) or [sponsor us on GitHub](https://github.com/sponsors/ChurchApps/). Thank you so much!

### 🏘️ Join the Community

We have a great community for end-users on [Facebook](https://www.facebook.com/churchapps.org). It's a good way to ask questions, get tips and follow new updates. Come join us!

### ⚠️ Report an Issue

If you discover an issue or have a feature request, simply submit it to our [issues log](https://github.com/ChurchApps/ChurchAppsSupport/issues). Don't be shy, that's how the program gets better.

### 💬 Join us on Slack

If you would like to contribute in any way, head over to our [Slack Channel](https://join.slack.com/t/livechurchsolutions/shared_invite/zt-i88etpo5-ZZhYsQwQLVclW12DKtVflg) and introduce yourself. We'd love to hear from you.

### 🏗️ Start Coding

Local setup is in the [development guide](DEVELOPMENT.md). The short version is:

1. This project uses Yarn. `yarn install`
2. Check out [WorshipCommonsContent](https://github.com/ChurchApps/WorshipCommonsContent) as a sibling folder.
3. `yarn sync-catalog` copies that library's `catalog.json` into `config/catalog.json`.
4. `yarn dev` starts the API.
