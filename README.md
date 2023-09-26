# Jira Importer

This plugin imports your data from [jira](https://jira.atlassian.com) into [Tyme](https://www.tyme-app.com). 

The plugin uses the [Jira API](https://developer.atlassian.com/server/jira/platform/rest-apis/) to fetch the data.

## Install

Please generate your own API key to access Jira data.

The url for the query must be in the form of https://your-project.atlassian.net/rest/api/2/search

For the query you can use this one as a starting point:

```
(issuetype = Epic OR issuetype = Story OR issuetype = Task) and project in ('ProjectA', 'ProjectB')
```

The username is needed for authorization. 
