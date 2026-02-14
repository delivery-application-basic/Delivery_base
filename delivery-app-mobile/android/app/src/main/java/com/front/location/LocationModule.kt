package com.front.location

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

class LocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SimpleLocation"

    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(reactContext)

    @ReactMethod
    fun getCurrentPosition(promise: Promise) {
        val context = reactApplicationContext
        
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("E_PERMISSION_DENIED", "Location permission not granted")
            return
        }

        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, null)
            .addOnSuccessListener { location ->
                if (location != null) {
                    val map = Arguments.createMap()
                    map.putDouble("latitude", location.latitude)
                    map.putDouble("longitude", location.longitude)
                    promise.resolve(map)
                } else {
                    promise.reject("E_LOCATION_NULL", "Location is null")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("E_LOCATION_ERROR", e.message)
            }
    }
}
