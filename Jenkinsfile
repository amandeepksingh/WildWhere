// def remote = [:]
// remote.name ="ww-prd"
// remote.host ="ec2-13-58-233-86.us-east-2.compute.amazonaws.com"
// remote.allowAnyHosts = true

import java.text.SimpleDateFormat
import java.time.LocalDate
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
                script {
                    def d = LocalDate.now()
                    def currentDay = d.dayOfMonth
                }
               sh 'echo "Deploying..."'
               withCredentials([sshUserPrivateKey(credentialsId: 'ww-prod-cred', keyFileVariable: 'SSH_KEY')]) {
                sh '''
                    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'mkdir test$currentDay'
                    scp backend $env.WW_PROD_USR@ec2-13-58-233-86.us-east-2.compute.amazonaws.com:/home/ec2-user/$test$currentDay
                '''
               } 
              
            // script {
            //     sh '''
            //         ssh -i $WW_PROD_PSW $WW_PROD_USR@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'mkdir newtest'
            //         scp -i $env.WW_PROD_PSW -r backend $env.WW_PROD_USR@ec2-13-58-233-86.us-east-2.compute.amazonaws.com:/home/ec2-user/newtest
            //     '''
            // }
               
            }
        }
    }
    
    // Only run this pipeline for branches with names starting with 'feature/'
    // when {
    //     branch 'feature/*'
    // }
}
