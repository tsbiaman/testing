# SSH Key Verification Script

#!/bin/bash

echo "🔍 SSH Key Verification for GitHub Actions"
echo "=========================================="

# Check if SSH key exists
if [ -z "$TSBI_SSH_KEY" ]; then
    echo "❌ ERROR: TSBI_SSH_KEY environment variable is not set!"
    echo ""
    echo "📋 To fix this:"
    echo "1. Go to your GitHub repository"
    echo "2. Settings → Secrets and variables → Actions"
    echo "3. Add a new secret named: TSBI_SSH_KEY"
    echo "4. Paste your PRIVATE SSH key content"
    exit 1
fi

echo "✅ TSBI_SSH_KEY secret is set"

# Check SSH key format
if echo "$TSBI_SSH_KEY" | grep -q "BEGIN OPENSSH PRIVATE KEY"; then
    echo "✅ SSH key appears to be in OpenSSH format"
elif echo "$TSBI_SSH_KEY" | grep -q "BEGIN RSA PRIVATE KEY"; then
    echo "✅ SSH key appears to be in RSA format"
else
    echo "⚠️  WARNING: SSH key format may be incorrect"
    echo "   Expected to see 'BEGIN OPENSSH PRIVATE KEY' or 'BEGIN RSA PRIVATE KEY'"
fi

# Check for common issues
if echo "$TSBI_SSH_KEY" | grep -q " "; then
    echo "⚠️  WARNING: SSH key contains spaces - this might cause issues"
fi

echo ""
echo "🔧 Testing SSH connection..."

# Create temporary SSH key file
mkdir -p /tmp/ssh_test
echo "$TSBI_SSH_KEY" > /tmp/ssh_test/id_rsa
chmod 600 /tmp/ssh_test/id_rsa

# Test SSH connection (if host is available)
if [ -n "$TSBI_HOST" ] && [ -n "$TSBI_USER" ]; then
    echo "Testing connection to $TSBI_USER@$TSBI_HOST..."
    ssh -i /tmp/ssh_test/id_rsa -o StrictHostKeyChecking=no -o ConnectTimeout=10 $TSBI_USER@$TSBI_HOST "echo 'SSH connection successful!'" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SSH connection test passed!"
    else
        echo "❌ SSH connection test failed"
        echo "   This could be due to:"
        echo "   - Wrong SSH key"
        echo "   - Public key not added to server"
        echo "   - Wrong username or host"
        echo "   - Firewall blocking connection"
    fi
else
    echo "⚠️  Cannot test SSH connection - TSBI_HOST or TSBI_USER not set"
fi

# Cleanup
rm -rf /tmp/ssh_test

echo ""
echo "📝 Next steps:"
echo "1. If SSH key format looks correct, check that the public key is added to your VPS"
echo "2. Verify TSBI_HOST and TSBI_USER secrets are set correctly"
echo "3. Test manual SSH connection: ssh -i /path/to/private/key user@host"