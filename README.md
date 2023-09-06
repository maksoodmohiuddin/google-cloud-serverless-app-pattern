# Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase

This repository contains the source code and configuration files for a Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase.

The application consists of a frontend developed using Angular, a backend developed using Python Flask, and a Firestore database. The infrastructure is managed using Terraform, and application code/containers build & deployment is managed using Cloud Build.


## Architecture

The application follows a three-tier architecture, with separate layers for the frontend, backend, and database. Here's an overview of each component:

**Frontend**: The frontend is built using Angular, a popular web development framework. It runs on Cloud Run, a fully managed serverless platform on Google Cloud. Cloud Run provides automatic scaling and handles container orchestration.

**Backend**: The backend is developed using Flask, a lightweight Python web framework. It also runs on Cloud Run, allowing for easy scalability and management. The backend handles the business logic of the application and interacts with the Firestore database. Backend is exposed via API gateway, a fully managed gateway for serverless workloads in Google Cloud. 

**Database**: The application uses Firestore, a NoSQL document database provided by Google Cloud. Firestore offers a flexible data model and automatic scalability. It is used to store and retrieve data required by the application.

## A note about cost

This tutorial is geared towards cloud engineer who like to explore serverless offering from Google Cloud. As such, a typical deployment of the application for noncommercial use should be covered under Google Cloud Free Program. However, please visit Google Cloud Free tier program page to learn more: https://cloud.google.com/free. 

Benefit of running a serverless application is charges are based on usage only and there's no heavy lifting to setup virtual private networks or firewalls. Moreover, google cloud free tier has a generous  offering for the serverless services used in this project:
- Learn more about [Cloud Run Free Tier](https://cloud.google.com/free/docs/free-cloud-features#cloud-run)
- Learn more about [Cloud Build Free Tier](https://cloud.google.com/free/docs/free-cloud-features#cloud-build)
- Learn more [Firestore Free Tier](https://cloud.google.com/free/docs/free-cloud-features#firestore)

Only service that is not part of free tier is API Gateway, however, it allows up to 2 millon API call per account per month free!

- Learn more about [API Gateway Pricing Free Tier](https://cloud.google.com/api-gateway/pricing)

So, in most cases, you should be able to deploy and run this application with very low to no cost.

Below are the services and the related cost (as of September 2023) we will be using for this tutorial:  
 
- Cloud Run free tier offers monthly 2 million requests, 360,000 GB-seconds of memory, 180,000 vCPU-seconds of compute time and 1 GB network egress (North America Only).   
- Firestore free tier offers 1 GB storage per project and 50,000 reads / 20,000 writes / 20,000 deletes per day, per project  
- Cloud Build free tier offers120 build-minutes per day.  
- Artifact Registry free tier offers 0.5 GB storage per month.
- API Gateway is not part of free tier offering, however, offer up to 2 million API call per billing account per month free. 

 
## Getting Started

To simplify and centralize, we use this single repository to hold all of the application, infrastructure, and pipeline code.

Projects are required to manage and organize resources in Google Cloud. We recommend creating a new project for this tutorial. This tutorial assumes that you have a Google Cloud project with admin access and you will be using the Google Cloud Cloud Shell.

To access your project in the Google Cloud console, navigate to the Google Cloud console and log in (or create an account), then select your project. If you do not already have a Google Cloud project, navigate to **Menu** > **IAM & Admin** > **Create a Project** then follow the prompts in the console.

## Initial Setup
In this section, you will do initial setup.

**Step 1**
[Open a new Cloud Shell session.](https://console.cloud.google.com/?cloudshell=true)

**Step 2 - Download the source code for this tutorial**

In the cloud shell session, git clone the reference application. You can clone this repo to start, however, we recommend you fork the repo and cloned the forked repo. As part of this step-by-step guide, we will provide instruction on how to change the code to deploy the three-tier serverless application in your google project.  

```
git clone [original https://github.com/maksoodmohiuddin/google-cloud-serverless-app-pattern.git or forked repo] 
```

```
cd google-cloud-serverless-app-pattern
```

From here you can select “Open Editor” to launch the Cloud Shell Editor.  

**Step 3 - Update Terraform to use your Google Project**
Next, let's update project_id and location with google cloud project you are using and a target google cloud region (e.g., us-west4) where you like to deploy this application. Our example shows nano as an editor; however, you can choose to use another available editor that you may prefer to use.  

```
cd infra 
```

```
nano variables.tf
```
Please choose a region that support Cloud Builds, Cloud Run, Firebase, API Gateway and Artifact Registry. For personal account, Cloud Build restricted to limited regions. Therefore, if you are using a personal account, we recommend using one of the below regions: 

To learn more about Google Cloud Region and supported region for the services for this app, please visit:  

- Learn more about [Google Cloud Region](https://cloud.withgoogle.com/region-picker/).
- Learn more about [Google Cloud Region that supports Firebase](https://cloud.google.com/firestore/docs/locations).
- Learn more about [Google Cloud Region that supports Cloud Build](https://cloud.google.com/build/docs/locations).
- Learn more about [Google Cloud Region that supports Cloud Run](https://cloud.google.com/run/docs/locations).
- Learn more about [Google Cloud Region that supports API Gateway]((https://cloud.google.com/api-gateway/docs/deployment-model).

For personal account, Cloud Build restricted to limited regions. Therefore, if you are using a personal account, We recommned using one of the below regions:

us-west2  
asia-east1   
southamerica-east1  

```
variable "project_id" {
  description = "Project ID of the GCP project where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE WITH YOUR GOOGLE PROJECT ID"
}

variable "location" {
  description = "Location (region) where resources will be deployed"
  type        = string
  default     = "PLEASE UPDATE YOUR GOOGLE CLOUD REGION"
}
```

If not already updated, update Google Cloud Shell Console to use your project:
```
gcloud config set project [YOUR GOOGLE CLOUD PROJECT]
```

Verify:
```
gcloud config list
```

## Deploying Initial Infrastructure

n this section, you will deploy the initial infrastructure with Terraform. Due to dependency mapping that is not known to Terraform, we will need to target specific resources and setup the application sequentially. 
 
By default, Terraform stores state locally in a file named terraform.tfstate. For purpose of this tutorial, you can use the local state. However, if preferred, state can be stored in remote state using Google Cloud Storage. Remote state is always preferred for projects with multiple developers. If you are especially savvy with Terraform, you may find it easier to create the bucket with Terraform local state, then migrate the state into the bucket. 
See the Google Cloud documentation for more details on how to [Setup Remote Terraforn State using Cloud Storage](https://cloud.google.com/docs/terraform/resource-management/store-state)
 
Now,  we will continue with the initial infra deployment:

### Instructions

**Step 1**
Navigate to the `infra` folder:

```
cd ./infra
```

**Step 2**
Initialize Terraform:

```
terraform init
```

**Step 3**
Validate Terraform Plan:

```
terraform plan
```

If prompted to authorized cloud shell, please select Accept to continue. This is because Cloud Shell needs permission to use your credentials for the gcloud command and clicking Authorize grant permission to this and future calls. 

Output should be:
Plan: 18 to add, 0 to change, 0 to destroy.

**Step 4**
Apply the Terraform for the initial resources

```
terraform apply
```

When prompted, type yes to deploy the resources. It should match the plan.

 ## Deploying Backend, API Gateway & Frontend

**Step 1 -  Update backend python flask application code to use your Google Project**

Navigate to backend folder:

```
cd ../app/backend/
```

open the `firestore.py` file:
```
nano -l firestore.py
```

Update line 10 client with the google cloud project you are using for this:

```
client = firestore.Client(project="PLEASE UPDATE WITH YOUR GOOGLE CLOUD PROJECT")
```

**Step 2 - Trigger Cloud Build to deploy Backend**

You can review the cloud build file:
```
cat backend-cloudbuild.yaml
```

Use gcloud command line to deploy backend cloud run based on cloud build file:
```
gcloud builds submit --region=[YOUR GOOGLE CLOUD REGION] --config backend-cloudbuild.yaml
```

e.g.
```
gcloud builds submit  --region=us-west2 --config backend-cloudbuild.yaml
```
Note, the Cloud Build run can take several minutes to finish the run, this is expected. This cloud build file builds a docker image for the backend service, pushes it to Artifact Registry, and then deployed the images from the Artifact registry on a Cloud Run instance.  

**Step 3 - Review the Swagger Spec**

We use API Gatewway with Open API Swagger specifications to connect the backend cloud run to API Gateway and setup the API Gateway configuration. Review the file `api-gateway--espv2-definition.yml.tmpl` under infra folder:  
First cd back to the infra directory and enable enable_api_gateway flag to true: 

```
cd ../../infra
cat api-gateway--espv2-definition.yml.tmpl
``` 

Note that, firebase is used as authetication for API Gateway.

Learn more about

- Learn more about [Open API Specification for API Gateway](https://cloud.google.com/api-gateway/docs/openapi-overview).

- Learn more about [Swagger](https://swagger.io)

- Learn more about [Firebase as authetication for API Gateway](https://cloud.google.com/api-gateway/docs/authenticating-users-firebase)


**Step 4 - Deploy API Gateway**

While still in the infra directory, enable enable_api_gateway flag to true:

```
nano variables.tf
```

```
variable "enable_api_gateway" {
  description = "Feature flag to enable/disable API Gateway. Leverage this to deploy infra sequentially."
  type        = bool
  default     = true
}
```
Run the terraform plan and then apply:

```
terraform plan
```
Output should be:
Plan: 3 to add, 0 to change, 0 to destroy.

```
terraform apply
```

When prompted, type yes to deploy the resources. It should match the plan. Note deploying the API GW usually takes longer than other resources, this is normal.

**Step 5 - Configure Firebase**

Navigate to `https://console.firebase.google.com`

Create/Add project -> select your google cloud project from the dropdown -> Accept Terms -> Continue -> Confirm Plan -> Choose to enable Google Analytics or not -> Continue.

In the landing page of your firebase project, add your app as a web app to Firebase.

Alternatively,  under project overview > click on the gear icon >  navigate to project settings > register your app as a web app to Firebase.

Register your app with your chosen name (e.g. you can use your google project name).

Once app is registered, under SDK setup and configuration section (you can toggle to config section), copy the value for `const firebaseConfig` and paste the value into `app/frontend/src/environments/environments.ts`

**Wanring** Make sure to not check in the values of environments.ts into a git repository as these are sensitive information.

Navigate to frontend folder:

```
cd ../app/frontend/src/environments/
```

```
nano -l environment.ts
```

```
export const environment = {
  firebase: {
    apiKey: "PLEASE UPDATE",
    authDomain: "PLEASE UPDATE",
    projectId: "PLEASE UPDATE",
    storageBucket: "PLEASE UPDATE",
    messagingSenderId: "PLEASE UPDATE",
    appId: "PLEASE UPDATE",
    measurementId: "PLEASE UPDATE" // if measurement is enabled
  },
  production: false
};
```

**Step 6 - Configure Firebase Auth**
To use the Google provider for Firebase auth, while in Firebase console -

All products -> Authentication -> Get Started ->  Google  -> Enable -> Add support email -> Save

**Step 7 - Set Frontend API GateWay Config**

Run the following command to get the api-gateway config:

```
gcloud api-gateway gateways describe employee-gateway --location LOCATION --project PROJECT_ID --format 'value(defaultHostname)'
```

Output will look like below:

```
employee-gateway-#.#.gateway.dev
```

Update the three urls in `app/frontend/src/employee/services/firestore.service.ts` (keep the path e.g. employee as is), e.g.:

```
cd ../employee/services
```

```
nano -l firestore.service.ts
```

Update the three urls (line 13-15) in `app/frontend/src/employee/services/firestore.service.ts`  (keep the path e.g., employee as is). 
```
addEmployeeUrl = 'https://employee-gateway-#.#.gateway.dev/employee';
employeesUrl = 'https://employee-gateway-#.#.gateway.dev/employees';
deleteEmployeeUrl = 'https://employee-gateway-#.ue.gateway.dev/employee';
```

**Step 8 - Trigger Cloud Build to deploy Frontend**
Navigate to the frontend folder, review the cloud build file and use the gcloud cli to deploy the backend cloud instance. 

```
cd ../../.. 
```

```
cat frontend-cloudbuild.yaml
```

Use gcloud command line to deploy backend cloud run based on cloud build file:
```
gcloud builds submit  --region=[YOUR GOOGLE CLOUD REGION] --config frontend-cloudbuild.yaml
```

e.g.
```
gcloud builds submit  --region=us-west2 --config frontend-cloudbuild.yaml
```

**Step 9 - Update Firebase authorized domain with Frontend Cloud Run URL**

Frontend Cloud Run URL need to be authorized for OAuth operations in Firebase app.

You can use gcloud to get the cloud run URL:

```
gcloud run services describe SERVICE --region REGION --format 'value(status.url)'
```

e.g.
```
gcloud run services describe amazing-employees-frontend-service --region us-west2 --format 'value(status.url)'
```
Output should be:
https://amazing-employees-frontend-service-###.a.run.app

Copy that URL and to the OAuth redirect domains list in the Firebase:
browse to https://console.firebase.google.com/ and select your project:

Click on Authentication -> Settings Tab -> Authorized domains -> Add domain -> paste your Frontend Cloud Run URL.

**Step 10 - Validate end to end application**

Browse to your frontend cloud run URL (https://amazing-employees-frontend-service-###.a.run.app), use a google account to log in to the app - your Google Cloud Serverless Application Pattern using Cloud Run, API Gateway and Firebase is up and running!

### Cleaning up

We will not be able to run a terraform destroy here due to API GW config dependencies.

To avoid incurring charges to your Google Cloud account for the resources used in this tutorial, you can delete the project.

Deleting a project has the following consequences:

- If you used an existing project, you'll also delete any other work that you've done in the project.
- You can't reuse the project ID of a deleted project. If you created a custom project ID that you plan to use in the future, delete the resources inside the project instead. This ensures that URLs that use the project ID, such as an `appspot.com` URL, remain available.

To delete a project, do the following:

In the Cloud console, go to the [Projects page](https://console.cloud.google.com/iam-admin/projects).
In the project list, select the project you want to delete and click **Delete**.
In the dialog, type the project ID, and then click **Shut down** to delete the project.


## What's next

Please follow McKinsey Digital in Medium - https://medium.com/@mckinseydigital
