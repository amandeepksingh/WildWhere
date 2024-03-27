pipeline {
    agent any
    
    stages {
        stage('filter') {
            steps{
                sh 'echo "filtering out excess files"'
                sh """
                    find . -mindepth 1 -maxdepth 1 ! !  -name "${namesToKeep[0]}" ! -name "${namesToKeep[1]}" 
                """
 
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
