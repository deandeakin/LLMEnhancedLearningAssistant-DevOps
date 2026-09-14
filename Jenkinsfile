pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Installing backend dependencies'
                dir('backend') {
                    bat 'npm ci'
                }

                echo 'Building Android application'
                bat 'gradlew.bat clean assembleDebug'

                echo 'Archiving Android APK'
                archiveArtifacts artifacts: 'app/build/outputs/apk/debug/*.apk',
                                 fingerprint: true
            }
        }
    }
}