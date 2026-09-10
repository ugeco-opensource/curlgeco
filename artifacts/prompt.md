Context:
## Product summary
geco is a ai playground frontend.
More context can be found at: curlgeco_frontend/requirements.md

## Repository layout
- `curlgeco_frontend`: All frontend code.

ISSUE:
- This is a new project, recently rename to curlgeco from geco_frontend.
- This lacks design docs: HLD.md, LLD.md, open-api.yaml, schema.sql
- Account for following in design doc:
  - This lacks backend, but we need signup and login feature. I plan to use supabase for now. 
  - We need to add Google Tag Manager support too.
  - We need to have deploy/helm support. ref: ugeco_infra for the AKS cluster info. We will deploy the helm on that cluster only. curlgeco.ugeco.in will be the URL, create Ingress which works with master ingress.
  - Dockerfile to deploy the app, docker compose file in root to test locally
  - .env file and .example.env file.
  - Brand folder to anchor brand design, brand.md file which shall contain all brand related info like colors, curlgeco.logo.svg (design a logo: `{{curlgeco}}`  curlgeco written in curl: black, geco: yellow)
  - In frontend footer: curlgeco by ugeco.
- Once design docs are ready, Implement the chages

ERROR TRACE:
NA


TODO: (focused: submodule/frontend_matchmaker)

Pre Task:
1. Build Context:
1.1 Review `curlgeco_frontend/requirements.md` file to build design context.

1. Once Context (1.) is Built Store Context:
2.1 Update/Create Agent.md file if current file is not inline with the current built context.
2.2 Update/Create Readme.md file if current file is not inline with latest built context.

Task:
1. Build the Nextjs based frontend web app using `curlgeco_frontend/requirements.md`

Post Task:
1. Update Repo Context:
1.1 Update/Create docs in `design` folder to be in line with changes done.
1.2 Update/Create docs in  `submodule` folder to be in line with changes done.
1.3 Update/Create docs in  `deployment` folder to be in line with changes done.
