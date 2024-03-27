pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
               sh 'echo "Building..."'
               sh 'echo "jenkins sees the following files"'
               sh 'ls -l -a'
               sh 'rm frontend'
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
