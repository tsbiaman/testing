# SSH Key Setup Guide for GitHub Actions

## 🔑 Generate SSH Key Pair

If you don't have an SSH key pair, generate one:

```bash
# Generate a new SSH key pair (don't use a passphrase)
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/github_actions

# This creates:
# ~/.ssh/github_actions (private key)
# ~/.ssh/github_actions.pub (public key)
```

## 📋 Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### 1. `TSBI_SSH_KEY` (Required)
**Value:** The entire content of your **private key** file

```bash
# Copy the private key content
cat ~/.ssh/github_actions

# Or if using a different key:
cat ~/.ssh/id_rsa
```

**Important:** Copy the entire key including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### 2. `TSBI_HOST` (Required)
**Value:** Your VPS IP address or domain name
```
192.168.1.100
# or
your-server.tsbi.fun
```

### 3. `TSBI_USER` (Required)
**Value:** SSH username for your VPS
```
root
# or
ubuntu
# or
deploy
```

## 🔧 VPS Setup

### 1. Add Public Key to VPS

Copy your **public key** to the VPS:

```bash
# On your local machine
cat ~/.ssh/github_actions.pub

# Copy the output and add it to your VPS
```

On your VPS, add the public key to `~/.ssh/authorized_keys`:

```bash
# On your VPS
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2. Verify SSH Connection

Test the connection from your local machine:

```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions user@your-vps-ip

# If using default key location:
ssh user@your-vps-ip
```

## 🐛 Troubleshooting

### "can't connect without a private SSH key or password"

**Cause:** The `TSBI_SSH_KEY` secret is missing or invalid

**Solutions:**
1. ✅ Check that `TSBI_SSH_KEY` secret exists in GitHub
2. ✅ Ensure it's the **private key**, not public key
3. ✅ Include the full key with `-----BEGIN` and `-----END` lines
4. ✅ No extra spaces or characters

### "Permission denied (publickey)"

**Cause:** Public key not added to VPS or wrong permissions

**Solutions:**
1. ✅ Add public key to `~/.ssh/authorized_keys` on VPS
2. ✅ Set correct permissions: `chmod 600 ~/.ssh/authorized_keys`
3. ✅ Ensure SSH service allows key authentication

### "Host key verification failed"

**Cause:** GitHub doesn't know about your VPS host key

**Solution:** Add this to your workflow before the SSH step:

```yaml
- name: Add VPS to known hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.TSBI_HOST }} >> ~/.ssh/known_hosts
```

## 🔒 Security Best Practices

1. **Use dedicated SSH key** for GitHub Actions (not your personal key)
2. **Restrict SSH user** - don't use root, create a deploy user
3. **Limit key permissions** - key should only be used for deployment
4. **Rotate keys regularly** - change keys periodically
5. **Monitor access** - check logs for unauthorized access

## 📝 Example Secret Values

```
TSBI_SSH_KEY:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYE...
...rest of private key...
-----END OPENSSH PRIVATE KEY-----

TSBI_HOST: your-server.tsbi.fun
TSBI_USER: deploy
```

## ✅ Test Your Setup

After setting up secrets, trigger a workflow run to test the SSH connection.