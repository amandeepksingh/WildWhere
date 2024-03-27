pipeline {
    agent any
    
    stages {
        stage('filter') {
            steps{
                sh 'echo "filtering out excess files"'
                script {
                    // Define the list of names to keep
                    def namesToKeep = [".env", "backend"]
                    
                    // Execute shell command to remove files and directories
                    sh """
                        find . -mindepth 1 -maxdepth 1 ! -name "${namesToKeep[0]}"  & -name "${namesToKeep[1]}"
                    """
                    //  \
                    //     $(printf "! -name %s " "${namesToKeep[@]:1}") -exec rm -rf {} +
                }
            }
        }

        stage('Build') {
            steps {
               sh 'echo "Building..."'
               sh 'echo "jenkins sees the following files"'
               sh 'ls -l -a'
            }
        }
        stage('Test') {
            steps {
               sh 'echo "Testing..."'
               sh 'echo "test sees" & ls -l -a'
            }
        }
        stage('Deploy') {
            steps {
               sh 'echo "Deploying..."'
            }
        }
    }
    
    // Only run this pipeline for branches with names starting with 'feature/'
    // when {
    //     branch 'feature/*'
    // }
}
