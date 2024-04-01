// def remote = [:]
// remote.name ="ww-prd"
// remote.host ="172.31.18.250"
// remote.allowAnyHosts = true

pipeline {
    agent any
     environment{
                WW_PROD = credentials('ww-prod-cred');
     }
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
               dir('backend/src/process_src') {

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
              
            script {
                sh '''
                    ssh -i $WW_PROD_PSW $WW_PROD_USR@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'mkdir newtest'
                    scp -i $env.WW_PROD_PSW -r backend $env.WW_PROD_USR@ec2-13-58-233-86.us-east-2.compute.amazonaws.com:/home/ec2-user/newtest
                '''
            }
               
            }
        }
    }
    
    // Only run this pipeline for branches with names starting with 'feature/'
    // when {
    //     branch 'feature/*'
    // }
}
