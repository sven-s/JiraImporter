class JiraApiClient {

    constructor(apiKey, apiUrl, username, query) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.username = username;
        this.query = query;
    }

    getJSON() {        
        const auth = 'Basic ' + utils.base64Encode(this.username + ":" + this.apiKey);
        const response = utils.request(
            this.apiUrl,
            'GET',
            {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            {
                "jql": this.query,
                "maxResults": 1000,
            }
        );

        const statusCode = response['statusCode'];
        const result = response['result'];

        if (statusCode === 200) {            
            return JSON.parse(result);
        } else {
            tyme.showAlert('Jira API Error', JSON.stringify(response));
            return null;
        }
    }
}

class JiraImporter {
    constructor(apiKey, apiUrl, username, query) {       
        this.apiClient = new JiraApiClient(apiKey, apiUrl, username, query);
    }

    start() {
        const response = this.apiClient.getJSON();

        const idPrefix = "jira-";
        tyme.showAlert('Jira', 'Found ' + response.total + ' elements.');

        const id = idPrefix + 0;

        let tymeCategory = Category.fromID(id) ?? Category.create(id);
        tymeCategory.name = "Jira";
        
        response.issues.forEach(function (entry) {
            const id = entry["id"];

            // create for project
            const project = entry.fields.project;
            const projectId = idPrefix + project.id;
            let tymeProject = Project.fromID(projectId) ?? Project.create(projectId);
            tymeProject.name = project["key"];
            tymeProject.defaultHourlyRate = 90;
            tymeProject.category = tymeCategory;

            // create tasks
            const taskId = idPrefix + id;
            let tymeTask = TimedTask.fromID(taskId) ?? TimedTask.create(taskId);
            
            tymeTask.name = entry.key + ", " + entry.fields.summary.trim() + " (" + entry.fields.issuetype.name + ")";
            tymeTask.isCompleted = entry.fields.status.name === "Done";
            tymeTask.billable = true;
            tymeTask.plannedDuration = entry.fields.timeoriginalestimate;
            tymeTask.roundingMethod = 2; // int, down=0, nearest=1, up=2
            tymeTask.roundingMinutes = 15;
            if (entry.fields.duedate != null && entry.fields.duedate !== "<null>") {
                tymeTask.dueDate = new Date(entry.fields.duedate);
            }
            //tymeTask.startDate = new Date(entry.fields.created);
            tymeTask.project = tymeProject;

        }.bind(this));
    }    
}

const importer = new JiraImporter(formValue.jiraKey, formValue.jiraUrl, formValue.jiraUsername, formValue.jiraQuery);