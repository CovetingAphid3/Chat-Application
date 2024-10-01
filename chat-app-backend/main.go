package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    r.GET("/api/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "up"})
    })

    r.Run(":8080") // Start server on port 8080
}

