// swift-tools-version:5.5

import PackageDescription

let package = Package(
    name: "MovieAPI",
    products: [
        .executable(
            name: "MovieAPI",
            targets: ["MovieAPI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.0.0"),
        .package(url: "https://github.com/pvieito/PythonKit.git", .branch("master")),
    ],
    targets: [
        .executableTarget(
            name: "MovieAPI",
            dependencies: [.product(name: "Vapor", package: "vapor"),
                           .product(name: "PythonKit", package: "PythonKit")]),
    ]
)
