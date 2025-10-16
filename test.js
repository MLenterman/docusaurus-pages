const micromatch = require('micromatch');

console.log(micromatch(['a.js', 'a.txt'], ['*.js']));
function wildcardMatchRegExp(text, pattern) {
    const regexPattern = new RegExp("^" + pattern.replace(/\?/g, ".").replace(/\*/g, ".*") + "$");
    return regexPattern.test(text);
}
let allArtifacts = await github.rest.actions.listWorkflowRunArtifacts({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.payload.workflow_run.id
});

let workflowArtifactNames = allArtifacts.data.artifacts.map(artifact => artifact.name);
console.log(`Artifacts produced by workflow run [${workflowArtifactNames.join(', ')}]`);

let inputArtifactNames = "report-?, build-*, report-a"; // Prototype hardcoded TODO
let targetArtifactNames = inputArtifactNames.split(',').map(name => name.trim());
console.log(`Artifacts to be deleted [${targetArtifactNames.join(', ')}]`);

let matchingArtifacts = new Set();
for(let targetName of targetArtifactNames) {
    let matches = allArtifacts.data.artifacts.filter((artifact) => {
    return wildcardMatchRegExp(artifact.name, targetName);
    });
    matchingArtifacts.add(...matches);
}
console.log(`Artifacts found matching target names [${matchingArtifacts.values().map(artifact => artifact.name).join(', ')}]`);

for (let artifact of matchingArtifacts) {
    let deleted = await github.rest.actions.deleteArtifact({
    owner: context.repo.owner,
    repo: context.repo.repo,
    artifact_id: artifact.id
    });
    if (deleted.status != 204) {
        throw new Error(`Failed to delete artifact [${artifact.name} (${artifact.id})] - status: [${deleted.status}]`);
    }
    console.log(`Deleted artifact [${artifact.name} (${artifact.id}) successfully]`);
}