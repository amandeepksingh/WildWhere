pipeline {
    agent any
    
    stages {
        stage('filter') {
            steps{
                sh 'echo "filtering out excess files"'
                script {
                    echo "starting script"
                    def workspace = pwd()
                    // def keep = ['.env', 'backend']

                    // def dr = fileTree(dir: workspace)

                    // dr.each { fd -> 
                    //     def name = fd.getName()

                    //     if(!keep.contains(name)) {
                    //         echo "removing: ${name}"
                    //         fd.delete()
                    //     }
                    // }
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
