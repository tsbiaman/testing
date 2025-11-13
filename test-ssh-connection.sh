#!/bin/bash

# Test SSH connection with the generated keys

echo "🔍 Testing SSH Connection"
echo "========================"

# Check if required environment variables are set
if [ -z "$TSBI_HOST" ]; then
    echo "❌ TSBI_HOST not set. Please set it to your VPS IP/domain."
    exit 1
fi

if [ -z "$TSBI_USER" ]; then
    echo "❌ TSBI_USER not set. Please set it to your SSH username."
    exit 1
fi

echo "✅ Environment variables set:"
echo "   Host: $TSBI_HOST"
echo "   User: $TSBI_USER"
echo ""

# Test SSH connection
echo "🔗 Testing SSH connection..."
ssh -i ~/.ssh/github_deploy -o StrictHostKeyChecking=no -o ConnectTimeout=10 $TSBI_USER@$TSBI_HOST "echo 'SSH connection successful! Server time: $(date)'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH connection test PASSED!"
    echo "   Your SSH keys are working correctly."
    echo ""
    echo "📋 Next steps:"
    echo "   1. Copy the PRIVATE key above to TSBI_SSH_KEY GitHub secret"
    echo "   2. Copy the PUBLIC key above to your VPS ~/.ssh/authorized_keys"
    echo "   3. Run your GitHub Actions workflow again"
else
    echo ""
    echo "❌ SSH connection test FAILED!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure the PUBLIC key is added to your VPS ~/.ssh/authorized_keys"
    echo "   2. Check that SSH service is running on your VPS"
    echo "   3. Verify firewall allows SSH connections (port 22)"
    echo "   4. Test manual connection: ssh -i ~/.ssh/github_deploy $TSBI_USER@$TSBI_HOST"
fi