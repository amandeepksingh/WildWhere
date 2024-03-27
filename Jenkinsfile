pipeline {
    agent any
    
    stages {
        stage('filter') {
            steps{
                //until i can figure out how to programmatically do this hardcode                
                sh 'echo "filtering out excess files"'
                sh 'rm -r frontend'
                sh 'rm .gitignore'
                sh 'rm genTables.sql'
                sh 'rm README.md'
                sh 'rm .DS_Store'
                sh 'rm -r .git'
                sh 'rm -r backend/test'
                sh 'ls -l -a'
                //sh 'rm -r test'
            }
        }

        stage('Build') {
            steps {
               sh 'echo "Building..."'
               sh 'echo "jenkins sees the following files"'
               sh 'ls -l -a'
               dir('backend') {
                    sh 'ls -la'
               }
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
