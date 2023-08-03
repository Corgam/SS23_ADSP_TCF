resource "google_compute_instance" "adsp" {
  name         = "adsp"
  machine_type = "e2-standard-2"
  tags         = ["http-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2004-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata = {
    ssh-keys       = "ubuntu:${tls_private_key.ssh_key.public_key_openssh}"
    startup-script = "${file("setup.sh")}"
  }

  connection {
    user        = "ubuntu"
    host        = self.network_interface.0.access_config.0.nat_ip
    private_key = tls_private_key.ssh_key.private_key_pem
  }

  provisioner "file" {
    source      = "../../SS23_ADSP_TCF/"
    destination = "/home/ubuntu"
  }

  provisioner "remote-exec" {
    inline = [
      "docker compose -f /home/ubuntu/docker-compose.yml up -d --quiet-pull"
    ]
  }
}
