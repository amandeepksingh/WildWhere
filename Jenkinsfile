pipeline {
  agent any
  stages {
    stage('hello') {
      steps {
        sh 'echo "Hello World"'
      }
    }
  }

  when {
        branch 'feature/*'
  }
}
