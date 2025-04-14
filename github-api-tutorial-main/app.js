let gitHubUsername = ''; // Declare it globally so it can be accessed across the functions
const gitHubForm = document.getElementById('gitHubForm');

// Listen for submissions on GitHub username input form
gitHubForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission action

    // Get the GitHub username input field on the DOM
    let usernameInput = document.getElementById('usernameInput');

    // Get the value of the GitHub username input field
    gitHubUsername = usernameInput.value; // Store username globally

    console.log(`GitHub Username: ${gitHubUsername}`); // Check if username is correctly captured

    // Run GitHub API function, passing in the GitHub username
    requestUserRepos(gitHubUsername)
        .then(response => response.json()) // parse response into json
        .then(data => {
            let repoSelect = document.getElementById('repoSelect');
            let userRepos = document.getElementById('userRepos');
            userRepos.innerHTML = "";  // Clear previous repo list
            repoSelect.innerHTML = "";  // Clear previous dropdown options

            if (data.message === "Not Found") {
                let li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<p><strong>No account exists with username:</strong> ${gitHubUsername}</p>`;
                userRepos.appendChild(li);
            } else {
                // Add repos to the dropdown
                data.forEach(repo => {
                    let option = document.createElement('option');
                    option.value = repo.name;
                    option.textContent = repo.name;
                    repoSelect.appendChild(option);

                    // Create a card for each repo
                    let cardDiv = document.createElement('div');
                    cardDiv.classList.add('col-md-4', 'mb-4');
                    cardDiv.innerHTML = `
                        <div class="card repo-card">
                            <div class="card-body">
                                <h5 class="card-title">${repo.name}</h5>
                                <p class="card-text">${repo.description ? repo.description : 'Sem descrição.'}</p>
                                <a href="${repo.html_url}" target="_blank" class="btn btn-primary">View Repo</a>
                            </div>
                        </div>
                    `;
                    userRepos.appendChild(cardDiv);
                });
            }
        });
});

// Listen for when a repository is selected from the dropdown
document.getElementById('repoSelect').addEventListener('change', function() {
    let selectedRepo = this.value; // Get the selected repository

    console.log(`Selected Repository: ${selectedRepo}`); // Check if the correct repo is selected

    // If a repository is selected, fetch the commits for that repo
    if (selectedRepo && gitHubUsername) {
        fetchCommits(gitHubUsername, selectedRepo);
    } else {
        console.log('No repository selected or username is empty');
    }
});

// Function to fetch repositories for a specific user
function requestUserRepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos`);
}

// Function to fetch commits for a specific repository
function fetchCommits(username, repo) {
    let url = `https://api.github.com/repos/${username}/${repo}/commits`;

    console.log(`Fetching commits for: ${username}/${repo}`); // Check if the correct repo is passed

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            let commitList = document.getElementById('commitList');
            commitList.innerHTML = ""; // Clear previous commits list

            if (data.length === 0) {
                let li = document.createElement('li');
                li.classList.add('list-group-item');
                li.textContent = 'No commits found.';
                commitList.appendChild(li);
            } else {
                // Create a card for each commit
                data.forEach(commit => {
                    let cardDiv = document.createElement('div');
                    cardDiv.classList.add('col-md-4', 'mb-4');
                    cardDiv.innerHTML = `
                        <div class="card commit-card">
                            <div class="card-body">
                                <h5 class="card-title">Commit Message</h5>
                                <p class="card-text">${commit.commit.message}</p>
                                <p class="card-text"><small class="text-muted">${new Date(commit.commit.author.date).toLocaleString()}</small></p>
                            </div>
                        </div>
                    `;
                    commitList.appendChild(cardDiv);
                });
            }

        })
        .catch(error => {
            let commitList = document.getElementById('commitList');
            let li = document.createElement('li');
            li.classList.add('list-group-item');
            li.textContent = `Error: ${error.message}`;
            commitList.appendChild(li);
        });
}
