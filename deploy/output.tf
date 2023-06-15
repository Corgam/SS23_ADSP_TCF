output "vm_url" {
  value = "http://${google_compute_instance.adsp.network_interface.0.access_config.0.nat_ip}:80"
}
