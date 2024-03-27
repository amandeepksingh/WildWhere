pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
               sh 'echo "Building..."'
            }
        }
        stage('Test') {
            steps {
               sh 'echo "Testing..."'
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
