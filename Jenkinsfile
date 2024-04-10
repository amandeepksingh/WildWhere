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
               sh 'echo deploying to test server'
                withCredentials([sshUserPrivateKey(credentialsId: 'ww-dev-cred', keyFileVariable: 'SSH_D_KEY')]) {
                    script {
                        try {
                            def cm =  "  ssh -o StrictHostKeyChecking=no -i $SSH_D_KEY ec2-user@ec2-3-144-183-123.us-east-2.compute.amazonaws.com 'rm -r WWBUILD'"
                            def result = sh(script: cm, returnStatus: true)

                            if(result != 0) {
                                echo "no need to remove previous build"
                            }
                        
                        } catch(Exception e) {

                        }
                    
                        sh '''
                            ssh -o StrictHostKeyChecking=no -i $SSH_D_KEY ec2-user@ec2-3-144-183-123.us-east-2.compute.amazonaws.com 'mkdir WWBUILD'
                            scp -o StrictHostKeyChecking=no -i $SSH_D_KEY -r backend ec2-user@ec2-3-144-183-123.us-east-2.compute.amazonaws.com:/home/ec2-user/WWBUILD
                            scp -o StrictHostKeyChecking=no -i $SSH_D_KEY .env ec2-user@ec2-3-144-183-123.us-east-2.compute.amazonaws.com:/home/ec2-user/WWBUILD
                            ssh -o StrictHostKeyChecking=no -i $SSH_D_KEY ec2-user@ec2-3-144-183-123.us-east-2.compute.amazonaws.com 'node --version'
                            
                        '''
                       
                        
                    } 
                }
            }
        }
        stage('Deploy') {
            steps {
                // script {

                //     def d = new Date()
                //     // def currentDay = d.dayOfMonth
                //     println "$d"
                
                // }
               sh 'echo "Deploying..."'
               withCredentials([sshUserPrivateKey(credentialsId: 'ww-prod-cred', keyFileVariable: 'SSH_KEY')]) {
                    script {
                        def reg = input(
                        message: 'Deploy on to production server?', 
                        parameters: [
                            [$class: 'ChoiceParameterDefinition', 
                                choices: 'yes\nno', 
                                name: 'input', 
                                description: 'A select box option']
                        ])
                        println "$reg"
                        if(reg == "yes") {
                            try {
                            sh '''
                                ssh -o StrictHostKeyChecking=no -i $SSH_KEY ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'rm -r WWBUILD'
                            '''
                        } catch(Exception e) {

                        }
                    
                        sh '''
                            ssh -o StrictHostKeyChecking=no -i $SSH_KEY ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'mkdir WWBUILD'
                            scp -o StrictHostKeyChecking=no -i $SSH_KEY -r backend ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com:/home/ec2-user/WWBUILD
                            scp -o StrictHostKeyChecking=no -i $SSH_KEY .env ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com:/home/ec2-user/WWBUILD
                            ssh -o StrictHostKeyChecking=no -i $SSH_KEY ec2-user@ec2-13-58-233-86.us-east-2.compute.amazonaws.com 'node --version'
                            
                        '''
                        } else {
                            println "we have decided not to go forward with prod build"
                        }
                        
                    } 
                }
            } 
        }
    }
}
