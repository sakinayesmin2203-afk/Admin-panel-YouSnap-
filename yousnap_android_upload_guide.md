# YouSnap Android (Kotlin + Jetpack Compose) Upload Integration Guide

This guide provides the complete, production-grade implementation of Clean Architecture for uploading photos/videos from your Jetpack Compose Android app to Backblaze B2 via your Replit Node.js Backend.

## Backend Credentials
- **Replit Server Base URL:** `https://backblaze-b-2-express-integration--sakinayesmin220.replit.app`
- **Security Token:** `yousnap_secret_token_9126441937`

---

## 1. Dependencies Setup (`build.gradle.kts`)
Ensure you have the following dependencies in your `:app/build.gradle.kts` file:

```kotlin
dependencies {
    // Jetpack Compose
    implementation("androidx.compose.ui:ui:1.7.0")
    implementation("androidx.compose.material3:material3:1.3.0")
    implementation("androidx.activity:activity-compose:1.9.1")

    // Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Lifecycle & Coroutines
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
```

---

## 2. API Data Models & Retrofit Interface

### Data Models (`UploadModels.kt`)
```kotlin
package com.yousnap.app.data.model

import com.google.gson.annotations.SerializedName

data class PresignedUrlRequest(
    @SerializedName("fileName") val fileName: String,
    @SerializedName("contentType") val contentType: String
)

data class PresignedUrlResponse(
    @SerializedName("uploadUrl") val uploadUrl: String,
    @SerializedName("fileUrl") val fileUrl: String
)
```

### Retrofit Service Interface (`YouSnapApiService.kt`)
We use two interfaces: one for the Replit Metadata backend with Bearer Authorization, and another using direct `@Url` for uploading raw binary to Backblaze B2.

```kotlin
package com.yousnap.app.data.api

import com.yousnap.app.data.model.PresignedUrlRequest
import com.yousnap.app.data.model.PresignedUrlResponse
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Url

interface YouSnapApiService {
    
    // 1. Request Presigned Upload URL from Replit backend
    @POST("api/upload/presigned-url")
    suspend fun getPresignedUrl(
        @Header("Authorization") bearerToken: String,
        @Body request: PresignedUrlRequest
    ): Response<PresignedUrlResponse>
}

interface DirectUploadService {
    
    // 2. Direct upload to the presigned Backblaze B2 S3 storage URL via PUT method
    @PUT
    suspend fun uploadFileToB2(
        @Url presignedUrl: String,
        @Header("Content-Type") contentType: String,
        @Body fileBody: RequestBody
    ): Response<Unit>
}
```

---

## 3. Repository Layer (`UploadRepository.kt`)

### Interface
```kotlin
package com.yousnap.app.domain.repository

import android.net.Uri
import com.yousnap.app.data.model.PresignedUrlResponse

interface UploadRepository {
    suspend fun getPresignedUrl(fileName: String, contentType: String): Result<PresignedUrlResponse>
    suspend fun uploadFile(presignedUrl: String, contentType: String, fileUri: Uri): Result<Unit>
}
```

### Implementation
```kotlin
package com.yousnap.app.data.repository

import android.content.Context
import android.net.Uri
import com.yousnap.app.data.api.DirectUploadService
import com.yousnap.app.data.api.YouSnapApiService
import com.yousnap.app.data.model.PresignedUrlRequest
import com.yousnap.app.data.model.PresignedUrlResponse
import com.yousnap.app.domain.repository.UploadRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream

class UploadRepositoryImpl(
    private val context: Context,
    private val apiService: YouSnapApiService,
    private val directUploadService: DirectUploadService
) : UploadRepository {

    private val securityToken = "yousnap_secret_token_9126441937"

    override suspend fun getPresignedUrl(fileName: String, contentType: String): Result<PresignedUrlResponse> =
        withContext(Dispatchers.IO) {
            try {
                val bearerToken = "Bearer $securityToken"
                val request = PresignedUrlRequest(fileName, contentType)
                val response = apiService.getPresignedUrl(bearerToken, request)
                
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Error requesting URL: ${response.errorBody()?.string()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    override suspend fun uploadFile(presignedUrl: String, contentType: String, fileUri: Uri): Result<Unit> =
        withContext(Dispatchers.IO) {
            try {
                // Read bytes from ContentResolver safely
                val contentResolver = context.contentResolver
                val inputStream: InputStream? = contentResolver.openInputStream(fileUri)
                val bytes = inputStream?.readBytes() ?: throw Exception("Failed to read selected file bytes")
                inputStream.close()

                val requestBody = bytes.toRequestBody(contentType.toMediaTypeOrNull())
                val response = directUploadService.uploadFileToB2(presignedUrl, contentType, requestBody)

                if (response.isSuccessful) {
                    Result.success(Unit)
                } else {
                    Result.failure(Exception("Direct B2 Upload Failed. Code: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
```

---

## 4. ViewModel Layer (`UploadViewModel.kt`)

```kotlin
package com.yousnap.app.presentation.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.yousnap.app.domain.repository.UploadRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class UploadState {
    object Idle : UploadState()
    object RequestingPresignedUrl : UploadState()
    object UploadingFile : UploadState()
    data class Success(val finalFileUrl: String) : UploadState()
    data class Error(val message: String) : UploadState()
}

class UploadViewModel(private val repository: UploadRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<UploadState>(UploadState.Idle)
    val uiState: StateFlow<UploadState> = _uiState.asStateFlow()

    fun uploadMedia(uri: Uri, fileName: String, contentType: String) {
        viewModelScope.launch {
            _uiState.value = UploadState.RequestingPresignedUrl
            
            // Step 1: Request presigned S3 url
            repository.getPresignedUrl(fileName, contentType)
                .onSuccess { response ->
                    _uiState.value = UploadState.UploadingFile
                    
                    // Step 2: Directly upload file bytes to Backblaze B2 using presigned URL
                    repository.uploadFile(response.uploadUrl, contentType, uri)
                        .onSuccess {
                            _uiState.value = UploadState.Success(response.fileUrl)
                        }
                        .onFailure { error ->
                            _uiState.value = UploadState.Error("Direct Upload Failed: ${error.localizedMessage}")
                        }
                }
                .onFailure { error ->
                    _uiState.value = UploadState.Error("Failed to get upload token: ${error.localizedMessage}")
                }
        }
    }

    fun resetState() {
        _uiState.value = UploadState.Idle
    }
}
```

---

## 5. UI Integration - Jetpack Compose Screen (`UploadScreen.kt`)

```kotlin
package com.yousnap.app.presentation.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.yousnap.app.presentation.viewmodel.UploadState
import com.yousnap.app.presentation.viewmodel.UploadViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadScreen(
    viewModel: UploadViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedUri by remember { mutableStateOf<Uri?>(null) }
    
    // Photo/Video picker launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedUri = uri
        viewModel.resetState()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("YouSnap Upload Studio", fontWeight = FontWeight.Black) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            )
        }
    ) { padding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            
            // Header Intro
            Text(
                text = "Upload Videos & Photos safely to Backblaze B2 Storage",
                fontSize = 14.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            // Select Area Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .border(2.dp, MaterialTheme.colorScheme.secondary, RoundedCornerShape(24.dp))
                    .background(Color.DarkGray.copy(alpha = 0.05f), RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    if (selectedUri != null) {
                        Text(
                            text = "✓ Media Selected Successfully",
                            color = Color(0xFF2E7D32),
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = selectedUri.toString().takeLast(35),
                            fontSize = 11.sp,
                            color = Color.Gray
                        )
                    } else {
                        Text("No media selected", color = Color.Gray)
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Button(
                        onClick = { galleryLauncher.launch("image/* video/*") },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                    ) {
                        Text("Select Video/Photo")
                    }
                }
            }

            // Upload Action Trigger
            Button(
                onClick = {
                    selectedUri?.let { uri ->
                        // Simulate values (in production, extract metadata from Uri)
                        viewModel.uploadMedia(
                            uri = uri,
                            fileName = "yousnap_media_${System.currentTimeMillis()}.jpg",
                            contentType = "image/jpeg"
                        )
                    }
                },
                enabled = selectedUri != null && uiState is UploadState.Idle,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1B5E20))
            ) {
                Text("Start Backblaze Upload", fontWeight = FontWeight.Bold)
            }

            // Real-time Upload Progress Indicator & Success States
            AnimatedVisibility(visible = uiState !is UploadState.Idle) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        when (val state = uiState) {
                            is UploadState.RequestingPresignedUrl -> {
                                Text("Step 1: Fetching Security Upload Token...", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                            }
                            is UploadState.UploadingFile -> {
                                Text("Step 2: Uploading raw binary to Backblaze B2...", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                LinearProgressIndicator(color = Color(0xFFF57C00), modifier = Modifier.fillMaxWidth())
                            }
                            is UploadState.Success -> {
                                Text("🎉 Upload Completed Successfully!", color = Color(0xFF2E7D32), fontWeight = FontWeight.Bold)
                                Text("File URL:", fontSize = 10.sp, color = Color.Gray)
                                Text(state.finalFileUrl, fontSize = 11.sp, textAlign = TextAlign.Center, color = Color.Blue)
                            }
                            is UploadState.Error -> {
                                Text("❌ Upload Failed", color = Color.Red, fontWeight = FontWeight.Bold)
                                Text(state.message, color = Color.DarkGray, fontSize = 11.sp, textAlign = TextAlign.Center)
                            }
                            else -> {}
                        }
                    }
                }
            }

        }
    }
}
```
