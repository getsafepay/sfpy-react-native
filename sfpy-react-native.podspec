require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'sfpy-react-native'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.author       = package['author']
  s.homepage     = 'https://github.com/safepay/sfpy-react-native'
  s.platforms    = { :ios => '15.1' }
  s.source       = { :path => '.' }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.requires_arc = true
  s.swift_version = '5.0'

  s.dependency 'React-Core'
  s.dependency 'SafepayiOSSDK'
end
