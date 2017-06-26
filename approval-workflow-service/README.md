# approval-workflow-service
This project exposes APIs to allow applications to use the features provided by the approval-workflow module.

## Storage
Currently the project supports cache based or file based persistance mechanisms. Depending on the storage used the request payload for certain APIs may change.

### Cache Based
By default the service will use cache unless specified otherwise in `process.env.STORAGE` variable.   
When cache is used the the workflow instance stays on memory for 30 mins. So it's a recomended approach is to call createWorkflow API before performing any other actions on the document.
The advantage of using this approach is that you can avoid passing the [document](#sample-document) parameter in other APIs. This will be only passed once when hitting the **createWorkflow** API

### File Based
To run the service with fileBased storage we need to set the enviroment variable **process.env.STORAGE** to **file**. This can be done as follows, in command-line.   
- STORAGE=file node server.js   
When using this approach an obvious advantage is now the createWorkflow API needs to be called once and the `workflowId` returned by the API needs to be persisted by the client Application.  
However, now we need to pass the [document](#sample-document) parameter with all the other API request.

### DB Based
To run the service with dbBased storage we need to set the enviroment variable **process.env.STORAGE** to **db**. This can be done as follows, in command-line.   
- STORAGE=db node server.js   
The main advantage of this approach is we get an extra option to store document on local server.
In **initialize.config** we need to set **externalHistory** variable as required.
For this option MongoDB Installation is prerequisite. We will be storing workflow model in the local MongoDB instead of file.  

## Installation
- Clone the repository
- run npm install
- Start the server using `node server.js`
- Once the server is running apidoc will be availaible on `<host>:3000/apidoc`
- A sample test suite would be availaible at `http://127.0.0.1:8125/#`

**Make sure you have node v6+ installed along with npm v3+**

# Common Objects
## Sample User
```
{
"user": "1", //unique identifier for the user
"role": "writer"
}
```
## Sample Document
```
{
"history":[ {
  "user": "1", //unique identifier for the user
  "role": "writer"
  "milestone": "submitted"
  "action": "submit"
}]
}
```


## Workflow Model
A workflow model is defined in the form of various **milestones** that signify the status of the document - for example:
* *draft* - could be a milestone that indicates that the document is still under progress
* *pending approval* - could be a milestone that indicates that the document is waiting for approval
* *published* - could be a milestone that indicates that the document is published
... and so on.

The document moves from one milestone to the other when an **action** is performed on it. For example:
* *submit* - could be an action that an author takes to submit a document for review or approval
* *approve* - could be an action that a reviewer takes to approve a document submitted by an author
* *reject* - could be an action that a reviewer takes to reject a document submitted by an author

Each milestone and action are restricted to be accessed by users based on their **role**. The workflow model specifies a list of roles that are relevant to the workflow.

A workflow model can be attached to any document to define the series of actions that need to be taken on that document.

## Sample Workflow model
The following JSON structure is a sample workflow model: For applications using approval-workflow-service this should be a json file within the application and must be sent as an object when creating a new wrokflow Instance.    
Another sample file can be found withing the `test` folder.
```
{
  "id":"sample-workflow",
  "name":"Sample Workflow",
  "description":"An example of a simple workflow model",
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft",
      "description":"Document is yet to be completed",
      "role":"author",
      "actions":[
        {
          "id":"save-draft",
          "name":"Save as Draft",
          "description":"Save document pending completion",
          "role":"_lastowner",
          "milestone":"draft"
        },
        {
          "id":"submit",
          "name":"Submit",
          "description":"Submit document for approval",
          "role":"_lastowner",
          "milestone":"pending-approval"
        }
      ]
    },
    "pending-approval":{
      "id":"pending-approval",
      "name":"Pending Approval",
      "description":"Document is pending approval",
      "role":["_owners","editor"],
      "actions":[
        {
          "id":"approve",
          "name":"Approve",
          "description":"Approve the document",
          "role":"editor",
          "milestone":"approved"
        },
        {
          "id":"reject",
          "name":"Reject",
          "description":"Reject the document",
          "role":"editor",
          "milestone":"rejected"
        },
      ]
    },
    "approved":{
      "id":"approved",
      "name":"Approved",
      "description":"Document is approved",
      "role":"_owners",
      "actions":[]
    },
    "rejected":{
      "id":"rejected",
      "name":"Rejected",
      "description":"Document is rejected",
      "role":"_owners",
      "actions":[]
    }
  }
}
```
## Meta Roles
As seen from the sample workflow above, in some cases we need to use roles which are to be interpreted based on some context. The following meta roles are supported:

* **_owners** : indicates all users who have performed any action on the document
* **_firstowner** : the user who performed the first action on the document
* **_lastowner**: the user who performed the last action on the document
* **_previousowner**: the user who performed the immediate previous action before the last action

## Meta Milestones
In some cases, the target milestone for an action may not be a constant, but may change based on rules. The following meta milestones are supported:

* **_lastmilestone** : the last milestone in the document's history
* **_previousmilestone** : The immediate previous milestone to the lastmilestone

## Role Combinations
Roles are used to restrict access to a milestone or action. Roles can be specified in the workflow definition in various formats. The following formats are supported:

**Single Role** : If the access is to be provided to a single role, the role can be specified as the role id. For example,
```
{
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft Document",
      "description":"Document saved as draft pending to be completed",
      "role":"author",
      "actions":[]
    }
  }
}
```
The above model contains a single milestone *draft* that is restricted to be accessed by a single role *author*

**Any One Role from List** : If the access is to be provided for any one role out of a list of roles, the role can be specified as an array of role ids. For example,
```
{
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft Document",
      "description":"Document saved as draft pending to be completed",
      "role":["author","editor"],
      "actions":[]
    }
  }
}
```
The above model contains a single milestone *draft* that is restricted to be accessed by a user with any one of the two roles *author* or *editor*

**Multiple Roles Combination** : If the access is to be provided based on a logical combination of different roles, then the role can be specified as an array of arrays. For example,
```
{
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft Document",
      "description":"Document saved as draft pending to be completed",
      "role":[["author","editor"],["_lastowner"]],
      "actions":[]
    }
  }
}
```
The above model contains a single milestone *draft* that is restricted to be accessed by a user with
* any one of the two roles *author* or *editor*
* **and** who is also the *last owner* of the document

**NOT role** : If the access is to be provided to a user who does **NOT** have a particular role, then the role has to be prefixed with a *!* character. For example,
```
{
  "milestones":{
    "approved":{
      "id":"approved",
      "name":"Approved Document",
      "description":"Document is approved",
      "role":[["author","editor"],["!_firstowner"]],
      "actions":[]
    }
  }
}
```
The above model contains a single milestone *approved* that is restricted to be accessed by a user with either `"author"` or `"editor"` roles and who is **not** the first owner of the document

## Global Actions
In some cases, the same actions may be applicable at multiple milestones. For example, a *save* action could be applicable at two milestones -  *draft* and *pending approval*. In such cases, rather than having to define the action properties twice in each of the applicable milestone, it is possible to define a global action and only customize it for each milestone.
For example,
```
{
  "actions":{
    "save":{
      "id":"save",
      "name":"Save Document",
      "description":"Save the document without changing it's milestone",
      "role":"_owners",
      "milestone":"_lastmilestone"
    }
  }
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft",
      "description":"Document is yet to be completed",
      "role":"author",
      "actions":["save",
        {
          "id":"submit",
          "name":"Submit",
          "description":"Submit document for approval",
          "role":"_lastowner",
          "milestone":"pending-approval"
        }
      ]
    },
    "pending-approval":{
      "id":"pending-approval",
      "name":"Pending Approval",
      "description":"Document is pending approval",
      "role":["_owners","editor"],
      "actions":["save",
        {
          "id":"approve",
          "name":"Approve",
          "description":"Approve the document",
          "role":"editor",
          "milestone":"approved"
        }
      ]
    },
}
```
In the above model, we have created a global action *save* that is applicable at the two milestones *draft* and *pending-approval* both. As illustrated above, the action is defined at the global level and each milestone merely refers to it by it's id.

### Overriding The Global Action Properties
It is also possible to override the global action's properties in the milestone. For example,
```
{
  "actions":{
    "save":{
      "id":"save",
      "name":"Save Document",
      "description":"Save the document without changing it's milestone",
      "role":"_owners",
      "milestone":"draft"
    }
  }
  "milestones":{
    "draft":{
      "id":"draft",
      "name":"Draft",
      "description":"Document is yet to be completed",
      "role":"author",
      "actions":[
        {
          "id":"save",
          "role":"author"          
        },
        {
          "id":"submit",
          "name":"Submit",
          "description":"Submit document for approval",
          "role":"_lastowner",
          "milestone":"pending-approval"
        }
      ]
    },
    "pending-approval":{
      "id":"pending-approval",
      "name":"Pending Approval",
      "description":"Document is pending approval",
      "role":["_owners","editor"],
      "actions":[
        {
          "id":"save",
          "milestone":"pending-approval"          
        },
        {
          "id":"approve",
          "name":"Approve",
          "description":"Approve the document",
          "role":"editor",
          "milestone":"approved"
        }
      ]
    },
}
```
In the above model, though there is a global action *save*, the two milestones that use it have overridden some properties.

When properties of a global action are overridden by a milestone, the properties specified in the milestone will override those defined in the global action. The only exception to this is the role property.

When a milestone overrides the role of a global action, the role(s) specified in the global action and the roles specified in the milestone are **combined** using the **multiple roles combination** rule specified above.

In the previous example, the `"draft"` milestone overrides the `"role"` of the `"save"` action. The role in the global action is `"_owners"` while the role specified in the milestone is `"author"`. This is converted into `[["_owners"],["author"]]`. That means, only users who are owners of the document **and** who have role as *author* can perform the *save* action.
`
`
