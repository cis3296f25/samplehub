# SampleHub
A web application for finding new loops and samples.

# How to install
Clone this repository and install the dependencies:
```bash
git clone https://github.com/cis3296f25/samplehub.git
cd frontend
npm install
```
Or using yarn
```bash
yarn install
```

# How to contribute
Follow this project board to know the latest status of the project: [SampleHub](https://github.com/orgs/cis3296f25/projects/58/views/1)  

### How to build
For the stable release, use the main branch.

# Connect API
Follow this website to create an API key for your own: [https://freesound.org/apiv2/apply/]

And inside samplehub folder find .env for your environment variables

```bash
FREESOUND_API_KEY=your_API_KEY_HERE
```

Replace your_API_KEY_HERE with the key that you generate


For the cutting-edge development version, use the dev branch.
```bash
npm run build
```

Start the development server:
```bash
npm run dev
```

Then open your browser and visit:
```bash
http://localhost:5173
```
